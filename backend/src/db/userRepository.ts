import { UserDto } from "@campuscore/shared";
import { getDb } from "./connection.js";
import { hashPassword } from "../utils/crypto.js";

export interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: UserDto["role"];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoredSession {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export const inMemoryUsers: StoredUser[] = [];
export const inMemorySessions: StoredSession[] = [];

let adminInitialized = false;

export async function ensureSharedSeed(): Promise<void> {
  if (adminInitialized) return;
  const adminPasswordHash = await hashPassword("Admin@123456");
  inMemoryUsers.push({
    id: "1",
    email: "admin@campuscore.edu",
    passwordHash: adminPasswordHash,
    firstName: "System",
    lastName: "Administrator",
    role: "SUPER_ADMIN",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const studentPasswordHash = await hashPassword("StudentPass123!");
  inMemoryUsers.push({
    id: "2",
    email: "demo.student@campuscore.edu",
    passwordHash: studentPasswordHash,
    firstName: "Demo",
    lastName: "Student",
    role: "STUDENT",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  adminInitialized = true;
}
