import type { UserDto } from "@campuscore/shared";
import { getDb } from "../db/connection.js";
import { verifyPassword, hashPassword, needsPasswordRehash, generateSessionToken, hashToken } from "../utils/crypto.js";

export class AuthService {
  static async login(
    email: string,
    password: string
  ): Promise<{ user: UserDto; rawToken: string; expiresAt: Date } | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const db = getDb();
    const user = await db("users").where({ email: normalizedEmail }).first();
    if (!user || !user.is_active) return null;

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) return null;

    if (needsPasswordRehash(user.password_hash)) {
      const upgradedHash = await hashPassword(password);
      await db("users")
        .where({ id: user.id, password_hash: user.password_hash })
        .update({ password_hash: upgradedHash, updated_at: new Date() });
    }

    const { rawToken, tokenHash } = generateSessionToken();
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
    await db("sessions").insert({
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: expiresAt
    });

    const userDto: UserDto = {
      id: String(user.id),
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      isActive: Boolean(user.is_active),
      createdAt: new Date(user.created_at).toISOString()
    };

    return { user: userDto, rawToken, expiresAt };
  }

  static async validateSession(rawToken: string): Promise<UserDto | null> {
    if (!rawToken) return null;

    const db = getDb();
    const tokenHash = hashToken(rawToken);
    const session = await db("sessions")
      .where({ token_hash: tokenHash })
      .andWhere("expires_at", ">", new Date())
      .first();
    if (!session) return null;

    const user = await db("users").where({ id: session.user_id }).first();
    if (!user || !user.is_active) return null;

    return {
      id: String(user.id),
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      isActive: Boolean(user.is_active),
      createdAt: new Date(user.created_at).toISOString()
    };
  }

  static async logout(rawToken: string): Promise<boolean> {
    if (!rawToken) return true;

    const db = getDb();
    await db("sessions").where({ token_hash: hashToken(rawToken) }).del();
    return true;
  }
}
