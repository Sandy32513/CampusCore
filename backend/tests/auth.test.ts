import crypto from "node:crypto";
import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { getDb } from "../src/db/connection.js";
import { verifyPassword } from "../src/utils/crypto.js";

describe("Authentication API Integration Tests", () => {
  const app = createApp();

  it("POST /api/v1/auth/login with valid credentials should succeed and return user with cookie", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "admin@campuscore.edu",
        password: "Admin@123456"
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe("admin@campuscore.edu");
    expect(res.body.data.user.role).toBe("SUPER_ADMIN");

    // Cookie verification
    const cookies = res.headers["set-cookie"];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toContain("campuscore_session=");
    expect(cookies[0]).toContain("HttpOnly");
  });

  it("upgrades a legacy scrypt hash in MySQL before creating an authenticated session", async () => {
    const adminLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "admin@campuscore.edu", password: "Admin@123456" });
    expect(adminLogin.status).toBe(200);
    const adminCookie = adminLogin.headers["set-cookie"][0].split(";")[0];

    const email = `legacy-upgrade.${Date.now()}@campuscore.edu`;
    const password = "LegacyUpgradePass123!";
    const userRes = await request(app)
      .post("/api/v1/users")
      .set("Cookie", adminCookie)
      .send({ email, password, firstName: "Legacy", lastName: "Account", role: "STUDENT" });
    expect(userRes.status).toBe(201);
    const userId = userRes.body.data.user.id as string;

    const salt = crypto.randomBytes(16).toString("hex");
    const digest = await new Promise<Buffer>((resolve, reject) => {
      crypto.scrypt(password, salt, 64, (error, key) => error ? reject(error) : resolve(key));
    });
    const legacyHash = `${salt}:${digest.toString("hex")}`;
    const db = getDb();
    await db("users").where({ id: userId }).update({ password_hash: legacyHash });

    const login = await request(app).post("/api/v1/auth/login").send({ email, password });
    expect(login.status).toBe(200);
    expect(login.body.data.user.id).toBe(userId);
    const upgradedUser = await db("users").where({ id: userId }).first();
    expect(upgradedUser?.password_hash).toMatch(/^\$argon2id\$v=19\$/);
    expect(upgradedUser?.password_hash).not.toBe(legacyHash);
    expect(await verifyPassword(password, upgradedUser!.password_hash)).toBe(true);

    const sessionCookie = login.headers["set-cookie"][0].split(";")[0];
    const session = await request(app).get("/api/v1/auth/me").set("Cookie", sessionCookie);
    expect(session.status).toBe(200);
    expect(session.body.data.user.id).toBe(userId);
  });

  it("POST /api/v1/auth/login with invalid password should return 401 generic error", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "admin@campuscore.edu",
        password: "WrongPassword999!"
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
    expect(res.body.error.message).toBe("Invalid email or password");
  });

  it("POST /api/v1/auth/login with unknown email should return 401 generic error", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "unknown@example.com",
        password: "Password123!"
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("POST /api/v1/auth/login with invalid input format should return 400 validation error", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "not-an-email",
        password: "short"
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("GET /api/v1/auth/me without session should return 401", async () => {
    const res = await request(app).get("/api/v1/auth/me");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("UNAUTHENTICATED");
  });

  it("Full Auth Lifecycle: login -> check /me -> logout -> verify session revoked", async () => {
    // 1. Login
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "admin@campuscore.edu",
        password: "Admin@123456"
      });
    expect(loginRes.status).toBe(200);

    const cookie = loginRes.headers["set-cookie"][0].split(";")[0];

    // 2. Check /me with cookie
    const meRes = await request(app)
      .get("/api/v1/auth/me")
      .set("Cookie", cookie);

    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.data.user.email).toBe("admin@campuscore.edu");

    // 3. Logout
    const logoutRes = await request(app)
      .post("/api/v1/auth/logout")
      .set("Cookie", cookie);

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.success).toBe(true);

    // 4. Verify session is revoked
    const meAfterLogout = await request(app)
      .get("/api/v1/auth/me")
      .set("Cookie", cookie);

    expect(meAfterLogout.status).toBe(401);
  });
});
