import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import { hashPassword, needsPasswordRehash, verifyPassword } from "../../src/utils/crypto.js";

describe("password hashing", () => {
  it("creates and verifies Argon2id hashes", async () => {
    const hash = await hashPassword("correct horse battery staple");

    expect(hash).toMatch(/^\$argon2id\$v=19\$m=19456,t=2,p=1\$/);
    expect(await verifyPassword("correct horse battery staple", hash)).toBe(true);
    expect(await verifyPassword("wrong password", hash)).toBe(false);
    expect(needsPasswordRehash(hash)).toBe(false);
  });

  it("verifies legacy scrypt hashes and flags them for login-time upgrade", async () => {
    const password = "legacy password";
    const salt = crypto.randomBytes(16).toString("hex");
    const derivedKey = await new Promise<Buffer>((resolve, reject) => {
      crypto.scrypt(password, salt, 64, (error, key) => error ? reject(error) : resolve(key));
    });
    const legacyHash = `${salt}:${derivedKey.toString("hex")}`;

    expect(await verifyPassword(password, legacyHash)).toBe(true);
    expect(await verifyPassword("incorrect", legacyHash)).toBe(false);
    expect(needsPasswordRehash(legacyHash)).toBe(true);
  });

  it("rejects malformed or resource-excessive Argon2 parameters", async () => {
    const hash = await hashPassword("password");
    const excessive = hash.replace("m=19456", "m=99999999");

    expect(await verifyPassword("password", excessive)).toBe(false);
    expect(needsPasswordRehash(excessive)).toBe(true);
  });
});
