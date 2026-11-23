import { expect, test } from "@playwright/test";
import { MODULE_CATALOG } from "@campuscore/shared";

test.beforeEach(async ({ page }) => {
  await page.route("http://localhost:5000/api/v1/**", route => route.fulfill({
    status: 401,
    contentType: "application/json",
    body: JSON.stringify({ success: false, error: { message: "Sign in required" } })
  }));
});

test("dashboard reflects the frozen catalog and the closed Wave 8 gate", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".module-card").first()).toBeAttached();
  await expect(page.locator("#systemStatusText")).toHaveText("API health check failed");

  const frozenCatalogIds = MODULE_CATALOG
    .filter(module => module.status === "FROZEN")
    .map(module => module.id)
    .sort();
  const frozenCardIds = await page.locator('.module-card[data-status="FROZEN"]')
    .evaluateAll(cards => cards.map(card => (card as HTMLElement).dataset.moduleId ?? "").sort());

  expect(frozenCatalogIds).toHaveLength(12);
  expect(frozenCardIds).toEqual(frozenCatalogIds);
  await expect(page.getByTestId("frozen-modules-metric")).toContainText("12");
  await expect(page.getByTestId("audit-gate-metric")).toContainText("NOT READY");
  await expect(page.getByTestId("unresolved-findings-metric")).toContainText("8");
  await expect(page.getByTestId("unresolved-findings-metric")).toContainText("0 Critical · 8 High");
  await expect(page.locator("#viewDashboard")).toContainText("Wave 7 Complete");
  await expect(page.locator("#viewDashboard")).not.toContainText("41 / 41");
  await expect(page.locator("#viewDashboard")).not.toContainText("100% Pass");
  await expect(page.locator("#currentRoleBadge")).toHaveText("👤 Signed out");
});

test("frozen modules are not described as coming soon", async ({ page }) => {
  await page.goto("/");
  await page.locator('.module-card[data-module-id="v8-courses"]').click();

  await expect(page.locator("#csStatus")).toHaveText("FROZEN");
  await expect(page.locator("#csDesc")).toContainText("does not include its interactive view");

  await page.getByRole("link", { name: /Return to Dashboard/ }).click();
  await page.locator('.module-card[data-module-id="v12-teachers"]').click();
  await expect(page.locator("#csStatus")).toHaveText("PLANNED / COMING SOON");
});
