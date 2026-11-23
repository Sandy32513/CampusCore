import { expect, test } from "@playwright/test";

test("real browser login uses an HttpOnly session and restores it after reload", async ({ page, context }) => {
  test.skip(process.env.E2E_LIVE_BACKEND !== "1", "requires the isolated MySQL-backed CI API");

  await page.goto("/#module/auth");
  await expect(page.locator("#systemStatusText")).toHaveText("API & MySQL 8.4 Healthy");
  await expect(page.locator("#sessionStatusBox")).toContainText("Sign in to load account data");

  await page.locator("#authEmail").fill("admin@campuscore.edu");
  await page.locator("#authPassword").fill("Admin@123456");
  const loginResponsePromise = page.waitForResponse(response =>
    response.url() === "http://localhost:5000/api/v1/auth/login" && response.request().method() === "POST"
  );
  await page.getByRole("button", { name: "Sign In" }).click();
  const loginResponse = await loginResponsePromise;

  expect(loginResponse.status()).toBe(200);
  const loginBody = await loginResponse.json();
  expect(loginBody.data.user.email).toBe("admin@campuscore.edu");
  expect(loginBody.data).not.toHaveProperty("token");
  await expect(page.locator("#currentRoleBadge")).toHaveText("👤 SUPER_ADMIN");
  await expect(page.locator("#sessionStatusBox")).toContainText("Active Session: admin@campuscore.edu (SUPER_ADMIN)");

  const sessionCookie = (await context.cookies("http://localhost:5000"))
    .find(cookie => cookie.name === "campuscore_session");
  expect(sessionCookie).toBeDefined();
  expect(sessionCookie?.httpOnly).toBe(true);
  expect(sessionCookie?.sameSite).toBe("Lax");
  expect(await page.evaluate(() => document.cookie)).toBe("");
  expect(await page.evaluate(() => ({
    localStorage: Object.keys(localStorage),
    sessionStorage: Object.keys(sessionStorage)
  }))).toEqual({ localStorage: [], sessionStorage: [] });

  await page.reload();
  await expect(page.locator("#systemStatusText")).toHaveText("API & MySQL 8.4 Healthy");
  await expect(page.locator("#currentRoleBadge")).toHaveText("👤 SUPER_ADMIN");
  await expect(page.locator("#sessionStatusBox")).toContainText("Active Session: admin@campuscore.edu (SUPER_ADMIN)");
});
