import { randomBytes } from "node:crypto";
import type { UserDto, CreateUserInput, UpdateUserInput, QueryUsersInput } from "@campuscore/shared";
import { getDb } from "../db/connection.js";
import { hashPassword } from "../utils/crypto.js";

interface UserRow {
  id: number | string;
  email: string;
  password_hash?: string;
  first_name: string;
  last_name: string;
  role: UserDto["role"];
  is_active: number | boolean;
  created_at: string | Date;
}

function toUserDto(row: UserRow): UserDto {
  return {
    id: String(row.id),
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    role: row.role,
    isActive: Boolean(row.is_active),
    createdAt: new Date(row.created_at).toISOString()
  };
}

function isDuplicateEntry(error: unknown): boolean {
  return typeof error === "object" && error !== null &&
    "code" in error && error.code === "ER_DUP_ENTRY";
}

export class UserService {
  static async listUsers(query: QueryUsersInput): Promise<{ users: UserDto[]; total: number }> {
    const { page, pageSize, role, q } = query;
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
    return { users: rows.map((row) => toUserDto(row as UserRow)), total };
  }

  static async createUser(input: CreateUserInput): Promise<{ user?: UserDto; error?: string }> {
    const email = input.email.trim().toLowerCase();
    const db = getDb();
    const existing = await db("users").where({ email }).first();
    if (existing) return { error: "DUPLICATE_EMAIL" };

    const passwordHash = await hashPassword(input.password);
    let insertId: number | string;
    try {
      [insertId] = await db("users").insert({
        email,
        password_hash: passwordHash,
        first_name: input.firstName.trim(),
        last_name: input.lastName.trim(),
        role: input.role,
        is_active: true
      });
    } catch (error) {
      if (isDuplicateEntry(error)) return { error: "DUPLICATE_EMAIL" };
      throw error;
    }

    const row = await db("users").where({ id: insertId }).first();
    if (!row) throw new Error("The new user could not be loaded after creation");
    return { user: toUserDto(row as UserRow) };
  }

  static async getUserById(id: string): Promise<UserDto | null> {
    const row = await getDb()("users").where({ id }).first();
    return row ? toUserDto(row as UserRow) : null;
  }

  static async updateUser(id: string, input: UpdateUserInput): Promise<UserDto | null> {
    const db = getDb();
    const existing = await db("users").where({ id }).first();
    if (!existing) return null;

    const updates: Partial<{
      email: string;
      first_name: string;
      last_name: string;
      role: UserDto["role"];
      updated_at: Date;
    }> = { updated_at: new Date() };
    if (input.email !== undefined) updates.email = input.email.trim().toLowerCase();
    if (input.firstName !== undefined) updates.first_name = input.firstName.trim();
    if (input.lastName !== undefined) updates.last_name = input.lastName.trim();
    if (input.role !== undefined) updates.role = input.role;

    await db("users").where({ id }).update(updates);
    return this.getUserById(id);
  }

  static async updateStatus(
    id: string,
    isActive: boolean,
    currentAdminId: string
  ): Promise<{ user?: UserDto; error?: string }> {
    if (id === currentAdminId && !isActive) return { error: "CANNOT_DEACTIVATE_SELF" };

    const db = getDb();
    const existing = await db("users").where({ id }).select("id").first();
    if (!existing) return { error: "USER_NOT_FOUND" };

    await db.transaction(async (trx) => {
      await trx("users").where({ id }).update({ is_active: isActive, updated_at: new Date() });
      if (!isActive) await trx("sessions").where({ user_id: id }).del();
    });

    const user = await this.getUserById(id);
    return user ? { user } : { error: "USER_NOT_FOUND" };
  }

  static async resetPassword(
    id: string,
    newPassword?: string
  ): Promise<{ tempPassword?: string; error?: string }> {
    const db = getDb();
    const existing = await db("users").where({ id }).select("id").first();
    if (!existing) return { error: "USER_NOT_FOUND" };

    const temporaryPassword = newPassword ?? `${randomBytes(18).toString("base64url")}aA1!`;
    const passwordHash = await hashPassword(temporaryPassword);
    await db.transaction(async (trx) => {
      await trx("users").where({ id }).update({ password_hash: passwordHash, updated_at: new Date() });
      await trx("sessions").where({ user_id: id }).del();
    });

    return { tempPassword: temporaryPassword };
  }
}
