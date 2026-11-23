import crypto from "node:crypto";
import type { Knex } from "knex";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDb } from "../../src/db/connection.js";
import { AuthService } from "../../src/services/authService.js";
import { hashPassword } from "../../src/utils/crypto.js";

vi.mock("../../src/db/connection.js", () => ({ getDb: vi.fn() }));

describe("legacy password migration on login", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rehashes a valid legacy scrypt password with Argon2id before creating a session", async () => {
    const password = "existing account password";
    const salt = crypto.randomBytes(16).toString("hex");
    const digest = await new Promise<Buffer>((resolve, reject) => {
      crypto.scrypt(password, salt, 64, (error, key) => error ? reject(error) : resolve(key));
    });
    const legacyHash = `${salt}:${digest.toString("hex")}`;
    const updatedValues: unknown[] = [];
    const sessionValues: unknown[] = [];
    const user = {
      id: 7,
      email: "user@example.test",
      first_name: "Test",
      last_name: "User",
      role: "STUDENT",
      is_active: 1,
      password_hash: legacyHash,
      created_at: new Date("2026-01-01T00:00:00.000Z")
    };

    const db = Object.assign(vi.fn(() => ({
      where: vi.fn(() => ({
        first: vi.fn(async () => user),
        update: vi.fn(async (values: unknown) => {
          updatedValues.push(values);
          return 1;
        })
      })),
      insert: vi.fn(async (values: unknown) => {
        sessionValues.push(values);
        return [1];
      })
    })), {}) as unknown as Knex;
    vi.mocked(getDb).mockReturnValue(db);

    const result = await AuthService.login(" USER@example.test ", password);

    expect(result?.user.id).toBe("7");
    expect(result?.rawToken).toHaveLength(64);
    expect(updatedValues).toHaveLength(1);
    expect(updatedValues[0]).toMatchObject({ updated_at: expect.any(Date) });
    expect((updatedValues[0] as { password_hash: string }).password_hash).toMatch(/^\$argon2id\$/);
    expect(sessionValues).toHaveLength(1);
  });

  it("does not rehash an Argon2id password hash", async () => {
    const passwordHash = await hashPassword("new account password");
    const updates: unknown[] = [];
    const user = {
      id: 8,
      email: "new@example.test",
      first_name: "New",
      last_name: "User",
      role: "STUDENT",
      is_active: 1,
      password_hash: passwordHash,
      created_at: new Date("2026-01-01T00:00:00.000Z")
    };
    const db = Object.assign(vi.fn(() => ({
      where: vi.fn(() => ({
        first: vi.fn(async () => user),
        update: vi.fn(async (values: unknown) => {
          updates.push(values);
          return 1;
        })
      })),
      insert: vi.fn(async () => [1])
    })), {}) as unknown as Knex;
    vi.mocked(getDb).mockReturnValue(db);

    const result = await AuthService.login("new@example.test", "new account password");

    expect(result).not.toBeNull();
    expect(updates).toHaveLength(0);
  });
});
