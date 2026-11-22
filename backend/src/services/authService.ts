import { UserDto } from "@campuscore/shared";
import { getDb } from "../db/connection.js";
import { inMemoryUsers, inMemorySessions, ensureSharedSeed } from "../db/userRepository.js";
import { verifyPassword, generateSessionToken, hashToken } from "../utils/crypto.js";

export class AuthService {
  static async login(email: string, password: string): Promise<{ user: UserDto; rawToken: string; expiresAt: Date } | null> {
    await ensureSharedSeed();
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Try DB first if connected
    try {
      const db = getDb();
      const user = await db("users").where({ email: normalizedEmail }).first();
      if (user) {
        if (!user.is_active) return null;
        const valid = await verifyPassword(password, user.password_hash);
        if (!valid) return null;

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
    } catch {
      // Memory fallback
    }

    // 2. Memory store fallback
    const user = inMemoryUsers.find((u) => u.email === normalizedEmail);
    if (!user || !user.isActive) return null;

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) return null;

    const { rawToken, tokenHash } = generateSessionToken();
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);

    inMemorySessions.push({
      id: String(Date.now()),
      userId: user.id,
      tokenHash,
      expiresAt
    });

    const userDto: UserDto = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt
    };

    return { user: userDto, rawToken, expiresAt };
  }

  static async validateSession(rawToken: string): Promise<UserDto | null> {
    if (!rawToken) return null;
    const tokenHash = hashToken(rawToken);

    // 1. Check DB
    try {
      const db = getDb();
      const session = await db("sessions").where({ token_hash: tokenHash }).andWhere("expires_at", ">", new Date()).first();
      if (session) {
        const user = await db("users").where({ id: session.user_id }).first();
        if (user && user.is_active) {
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
      }
    } catch {
      // Memory fallback
    }

    // 2. Check Memory store
    const session = inMemorySessions.find((s) => s.tokenHash === tokenHash && s.expiresAt > new Date());
    if (!session) return null;

    const user = inMemoryUsers.find((u) => u.id === session.userId);
    if (!user || !user.isActive) return null;

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt
    };
  }

  static async logout(rawToken: string): Promise<boolean> {
    if (!rawToken) return true;
    const tokenHash = hashToken(rawToken);

    try {
      const db = getDb();
      await db("sessions").where({ token_hash: tokenHash }).del();
    } catch {
      // Ignore
    }

    const idx = inMemorySessions.findIndex((s) => s.tokenHash === tokenHash);
    if (idx !== -1) {
      inMemorySessions.splice(idx, 1);
    }

    return true;
  }
}
