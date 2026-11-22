import { UserDto, CreateUserInput, UpdateUserInput, QueryUsersInput } from "@campuscore/shared";
import { getDb } from "../db/connection.js";
import { inMemoryUsers, inMemorySessions, ensureSharedSeed, StoredUser } from "../db/userRepository.js";
import { hashPassword } from "../utils/crypto.js";

export class UserService {
  static async listUsers(query: QueryUsersInput): Promise<{ users: UserDto[]; total: number }> {
    await ensureSharedSeed();
    const { page, pageSize, role, q } = query;

    // 1. Try DB
    try {
      const db = getDb();
      let dbQuery = db("users");
      if (role) dbQuery = dbQuery.where({ role });
      if (q) {
        dbQuery = dbQuery.where((builder) => {
          builder.where("email", "like", `%${q}%`)
            .orWhere("first_name", "like", `%${q}%`)
            .orWhere("last_name", "like", `%${q}%`);
        });
      }
      const totalResult = await dbQuery.clone().count<{ count: number }>("id as count").first();
      const total = Number(totalResult?.count || 0);
      const rows = await dbQuery.offset((page - 1) * pageSize).limit(pageSize).orderBy("id", "asc");

      const users: UserDto[] = rows.map((r) => ({
        id: String(r.id),
        email: r.email,
        firstName: r.first_name,
        lastName: r.last_name,
        role: r.role,
        isActive: Boolean(r.is_active),
        createdAt: new Date(r.created_at).toISOString()
      }));

      return { users, total };
    } catch {
      // Memory fallback
    }

    // 2. Memory store
    let filtered = [...inMemoryUsers];
    if (role) filtered = filtered.filter((u) => u.role === role);
    if (q) {
      const queryLower = q.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.email.toLowerCase().includes(queryLower) ||
          u.firstName.toLowerCase().includes(queryLower) ||
          u.lastName.toLowerCase().includes(queryLower)
      );
    }

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const paginated = filtered.slice(start, start + pageSize);

    return {
      users: paginated.map((u) => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        isActive: u.isActive,
        createdAt: u.createdAt
      })),
      total
    };
  }

  static async createUser(input: CreateUserInput): Promise<{ user?: UserDto; error?: string }> {
    await ensureSharedSeed();
    const normalizedEmail = input.email.trim().toLowerCase();

    // Check duplicate
    if (inMemoryUsers.some((u) => u.email === normalizedEmail)) {
      return { error: "DUPLICATE_EMAIL" };
    }

    const passwordHash = await hashPassword(input.password);
    const id = String(inMemoryUsers.length + 1);
    const now = new Date().toISOString();

    const newUser: StoredUser = {
      id,
      email: normalizedEmail,
      passwordHash,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      role: input.role,
      isActive: true,
      createdAt: now,
      updatedAt: now
    };

    // Try DB
    try {
      const db = getDb();
      await db("users").insert({
        id,
        email: newUser.email,
        password_hash: newUser.passwordHash,
        first_name: newUser.firstName,
        last_name: newUser.lastName,
        role: newUser.role,
        is_active: true
      });
    } catch {
      // Memory fallback
    }

    inMemoryUsers.push(newUser);

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt
      }
    };
  }

  static async getUserById(id: string): Promise<UserDto | null> {
    await ensureSharedSeed();

    try {
      const db = getDb();
      const r = await db("users").where({ id }).first();
      if (r) {
        return {
          id: String(r.id),
          email: r.email,
          firstName: r.first_name,
          lastName: r.last_name,
          role: r.role,
          isActive: Boolean(r.is_active),
          createdAt: new Date(r.created_at).toISOString()
        };
      }
    } catch {
      // Memory fallback
    }

    const user = inMemoryUsers.find((u) => u.id === id);
    if (!user) return null;
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

  static async updateUser(id: string, input: UpdateUserInput): Promise<UserDto | null> {
    await ensureSharedSeed();
    const user = inMemoryUsers.find((u) => u.id === id);
    if (!user) return null;

    if (input.email) user.email = input.email.trim().toLowerCase();
    if (input.firstName) user.firstName = input.firstName.trim();
    if (input.lastName) user.lastName = input.lastName.trim();
    if (input.role) user.role = input.role;
    user.updatedAt = new Date().toISOString();

    // Try DB
    try {
      const db = getDb();
      await db("users").where({ id }).update({
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        role: user.role,
        updated_at: new Date()
      });
    } catch {
      // Memory
    }

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

  static async updateStatus(id: string, isActive: boolean, currentAdminId: string): Promise<{ user?: UserDto; error?: string }> {
    await ensureSharedSeed();
    if (id === currentAdminId && !isActive) {
      return { error: "CANNOT_DEACTIVATE_SELF" };
    }

    const user = inMemoryUsers.find((u) => u.id === id);
    if (!user) return { error: "USER_NOT_FOUND" };

    user.isActive = isActive;
    user.updatedAt = new Date().toISOString();

    // Try DB & revoke sessions
    try {
      const db = getDb();
      await db("users").where({ id }).update({ is_active: isActive });
      if (!isActive) {
        await db("sessions").where({ user_id: id }).del();
      }
    } catch {
      // Memory
    }

    if (!isActive) {
      // Revoke all in-memory sessions for this user
      for (let i = inMemorySessions.length - 1; i >= 0; i--) {
        if (inMemorySessions[i].userId === id) {
          inMemorySessions.splice(i, 1);
        }
      }
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    };
  }

  static async resetPassword(id: string, newPassword?: string): Promise<{ tempPassword?: string; error?: string }> {
    await ensureSharedSeed();
    const user = inMemoryUsers.find((u) => u.id === id);
    if (!user) return { error: "USER_NOT_FOUND" };

    const generated = newPassword || "TempPass@" + Math.random().toString(36).substring(2, 8) + "!";
    const newHash = await hashPassword(generated);
    user.passwordHash = newHash;

    try {
      const db = getDb();
      await db("users").where({ id }).update({ password_hash: newHash });
      await db("sessions").where({ user_id: id }).del();
    } catch {
      // Memory
    }

    // Revoke sessions
    for (let i = inMemorySessions.length - 1; i >= 0; i--) {
      if (inMemorySessions[i].userId === id) {
        inMemorySessions.splice(i, 1);
      }
    }

    return { tempPassword: generated };
  }
}
