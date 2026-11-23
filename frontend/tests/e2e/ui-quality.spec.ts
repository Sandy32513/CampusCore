import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("http://localhost:5000/api/v1/**", route => route.fulfill({
    status: 401,
    contentType: "application/json",
    body: JSON.stringify({ success: false, error: { message: "Sign in required" } })
  }));
});

test("primary views have no serious or critical axe violations", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".module-card").first()).toBeAttached();
  const views = [
    { name: "dashboard", hash: "#dashboard", selector: "#viewDashboard" },
    { name: "departments", hash: "#module/departments", selector: "#viewDepartments" },
    { name: "students", hash: "#module/students", selector: "#viewStudents" },
    { name: "subjects", hash: "#module/subjects", selector: "#viewSubjects" },
    { name: "backups", hash: "#module/backups", selector: "#viewBackups" },
    { name: "academic", hash: "#module/academic", selector: "#viewAcademic" },
    { name: "audit logs", hash: "#module/audit", selector: "#viewAudit" },
    { name: "users", hash: "#module/users", selector: "#viewUsers" },
    { name: "authentication", hash: "#module/auth", selector: "#viewAuth" },
    { name: "settings detail", hash: "#module/settings", selector: "#viewComingSoon" },
    { name: "planned module detail", hash: "#module/teachers", selector: "#viewComingSoon" }
  ];
  const issueSummaries = [];

  for (const view of views) {
    await page.goto(`/${view.hash}`);
    await expect(page.locator(view.selector)).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag21a", "wcag22aa"])
      .analyze();
    issueSummaries.push(...results.violations
      .filter(violation => violation.impact === "serious" || violation.impact === "critical")
      .flatMap(violation => violation.nodes.map(node => ({
        view: view.name,
        id: violation.id,
        impact: violation.impact,
        target: node.target,
        summary: node.failureSummary?.split("\n")[1]?.trim()
      }))));
  }

  expect(issueSummaries).toEqual([]);
});

test("student admission dialog is named, keyboard trapped, and restores focus", async ({ page }) => {
  await page.goto("/#module/students");
  const trigger = page.locator("#openAddStudentModalBtn");
  const dialog = page.locator("#addStudentModal");
  await trigger.click();
  await expect(dialog).toBeVisible();
  await expect(page.getByRole("heading", { name: "Admit New Student" })).toBeVisible();
  await expect(dialog.locator("button").first()).toBeFocused();

  const axeResults = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag21a", "wcag22aa"])
    .analyze();
  const modalViolations = axeResults.violations
    .filter(violation => violation.impact === "serious" || violation.impact === "critical")
    .flatMap(violation => violation.nodes.map(node => ({ id: violation.id, target: node.target })));
  expect(modalViolations).toEqual([]);

  await dialog.locator("button").last().focus();
  await page.keyboard.press("Tab");
  await expect(dialog.locator("button").first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("mobile navigation announces its state and closes after keyboard navigation", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await expect(page.locator(".module-card").first()).toBeAttached();

  const menu = page.getByRole("button", { name: "Toggle navigation menu" });
  const sidebar = page.locator("#appSidebar");
  await page.keyboard.press("Tab");
  await expect(menu).toBeFocused();
  const focusOutlineWidth = await menu.evaluate(element => Number.parseFloat(getComputedStyle(element).outlineWidth));
  expect(focusOutlineWidth).toBeGreaterThanOrEqual(3);
  await page.keyboard.press("Enter");
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(sidebar).toHaveClass(/open/);

  const studentsLink = sidebar.locator('[data-nav="students"]');
  await studentsLink.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#viewStudents")).toBeVisible();
  await expect(sidebar).not.toHaveClass(/open/);
  await expect(menu).toHaveAttribute("aria-expanded", "false");
});

test("dashboard fits the required viewport widths", async ({ page }, testInfo) => {
  for (const width of [375, 640, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.locator(".module-card").first()).toBeAttached();
    const dimensions = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth
    }));

    await page.screenshot({
      path: testInfo.outputPath(`dashboard-${width}.png`),
      fullPage: true
    });
    if (dimensions.document > dimensions.viewport) {
      const overflowingElements = await page.locator("body *").evaluateAll(elements => elements
        .map(element => {
          const rect = element.getBoundingClientRect();
          return {
            tag: element.tagName,
            id: element.id,
            className: typeof element.className === "string" ? element.className : "",
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
            scrollWidth: element.scrollWidth,
            clientWidth: element.clientWidth
          };
        })
        .filter(element => element.right > window.innerWidth + 1 || element.scrollWidth > element.clientWidth + 1)
        .slice(0, 20));
      console.log(`OVERFLOW_${width}px ${JSON.stringify(overflowingElements)}`);
    }
    expect(dimensions.document, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(dimensions.viewport);
  }
});
