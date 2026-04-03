import { test, expect } from "@playwright/test";

test.describe("Page rendering", () => {
  test("landing page loads with title and CTAs", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("main h1")).toBeVisible();
    await expect(page.locator("main").getByRole("link", { name: /dashboard/i })).toBeVisible();
  });

  test("dashboard page loads with stat cards", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("main h1")).toContainText(/dashboard/i);
  });

  test("workflows page loads with empty state or list", async ({ page }) => {
    await page.goto("/workflows");
    await expect(page.locator("main h1")).toContainText(/workflow/i);
  });

  test("templates page loads with template cards", async ({ page }) => {
    await page.goto("/templates");
    await expect(page.locator("main h1")).toContainText(/template/i);
    await expect(page.locator("main .bg-white.rounded-xl").first()).toBeVisible({ timeout: 10000 });
  });

  test("connectors page loads with connector cards", async ({ page }) => {
    await page.goto("/connectors");
    await expect(page.locator("main h1")).toContainText(/connector/i);
    await expect(page.locator("main").getByRole("heading", { name: "Slack" })).toBeVisible({ timeout: 10000 });
    await expect(page.locator("main").getByRole("heading", { name: "Jira" })).toBeVisible();
  });

  test("compliance page loads with framework cards", async ({ page }) => {
    await page.goto("/compliance");
    await expect(page.locator("main h1")).toContainText(/compliance|conformit/i);
    await expect(page.locator("main").getByText("SOC 2")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("main").getByText("GDPR")).toBeVisible();
  });

  test("security page loads with tabs", async ({ page }) => {
    await page.goto("/security");
    await expect(page.locator("main h1")).toContainText(/security|sicurezza/i);
    await expect(page.locator("main").getByRole("button", { name: /playbook/i })).toBeVisible();
    await expect(page.locator("main").getByRole("button", { name: /incident/i })).toBeVisible();
  });

  test("404 page shows rocket animation", async ({ page }) => {
    await page.goto("/nonexistent-page-xyz");
    await expect(page.getByText("404")).toBeVisible({ timeout: 5000 });
  });
});
