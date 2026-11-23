import crypto from "node:crypto";

const ARGON2_PARAMETERS = {
  memory: 19_456,
  passes: 2,
  parallelism: 1,
  tagLength: 32
} as const;

interface Argon2Hash {
  memory: number;
  passes: number;
  parallelism: number;
  salt: Buffer;
  digest: Buffer;
}

interface Argon2Parameters {
  memory: number;
  passes: number;
  parallelism: number;
  tagLength: number;
}

function deriveArgon2(password: string, salt: Buffer, parameters: Argon2Parameters): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.argon2(
      "argon2id",
      {
        message: password,
        nonce: salt,
        memory: parameters.memory,
        passes: parameters.passes,
        parallelism: parameters.parallelism,
        tagLength: parameters.tagLength
      },
      (error, digest) => {
        if (error) reject(error);
        else resolve(digest);
      }
    );
  });
}

function parseArgon2Hash(storedHash: string): Argon2Hash | null {
  const match = /^\$argon2id\$v=19\$m=(\d+),t=(\d+),p=(\d+)\$([A-Za-z0-9+/]+)\$([A-Za-z0-9+/]+)$/.exec(storedHash);
  if (!match) return null;

  const memory = Number(match[1]);
  const passes = Number(match[2]);
  const parallelism = Number(match[3]);
  const salt = Buffer.from(match[4], "base64");
  const digest = Buffer.from(match[5], "base64");
  if (
    !Number.isSafeInteger(memory) || memory < 8_192 || memory > 65_536 ||
    !Number.isSafeInteger(passes) || passes < 1 || passes > 5 ||
    !Number.isSafeInteger(parallelism) || parallelism < 1 || parallelism > 4 ||
    salt.length < 16 || digest.length < 16 || digest.length > 64
  ) {
    return null;
  }

  return { memory, passes, parallelism, salt, digest };
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  const digest = await deriveArgon2(password, salt, ARGON2_PARAMETERS);
  const saltBase64 = salt.toString("base64").replace(/=+$/, "");
  const digestBase64 = digest.toString("base64").replace(/=+$/, "");
  return `$argon2id$v=19$m=${ARGON2_PARAMETERS.memory},t=${ARGON2_PARAMETERS.passes},p=${ARGON2_PARAMETERS.parallelism}$${saltBase64}$${digestBase64}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (storedHash.startsWith("$argon2id$")) {
    const parsed = parseArgon2Hash(storedHash);
    if (!parsed) return false;

    try {
      const actual = await deriveArgon2(password, parsed.salt, {
        memory: parsed.memory,
        passes: parsed.passes,
        parallelism: parsed.parallelism,
        tagLength: parsed.digest.length
      });
      return actual.length === parsed.digest.length && crypto.timingSafeEqual(actual, parsed.digest);
    } catch {
      return false;
    }
  }

  // Existing scrypt hashes remain verifiable and are upgraded after a successful login.
  const [salt, key, extra] = storedHash.split(":");
  if (!salt || !key || extra !== undefined || !/^[a-f0-9]{32}$/i.test(salt) || !/^[a-f0-9]{128}$/i.test(key)) {
    return false;
  }

  return new Promise((resolve) => {
    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) return resolve(false);
      const expectedKey = Buffer.from(key, "hex");
      resolve(expectedKey.length === derivedKey.length && crypto.timingSafeEqual(expectedKey, derivedKey));
    });
  });
}

export function needsPasswordRehash(storedHash: string): boolean {
  const parsed = parseArgon2Hash(storedHash);
  if (!parsed) return true;
  return parsed.memory !== ARGON2_PARAMETERS.memory ||
    parsed.passes !== ARGON2_PARAMETERS.passes ||
    parsed.parallelism !== ARGON2_PARAMETERS.parallelism ||
    parsed.digest.length !== ARGON2_PARAMETERS.tagLength;
}

export function generateSessionToken(): { rawToken: string; tokenHash: string } {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  return { rawToken, tokenHash };
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
