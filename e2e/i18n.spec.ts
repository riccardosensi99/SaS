import { test, expect } from "@playwright/test";

test.describe("Internationalization (i18n)", () => {
  test("default language shows English content", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("main").getByText("Go to Dashboard")).toBeVisible();
    await expect(page.locator("main").getByText("View Workflows")).toBeVisible();
  });

  test("switching to Italian updates dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("main h1")).toContainText("Dashboard");

    await page.locator("aside").getByRole("link", { name: "Italiano" }).click();
    await page.waitForURL(/\/it\//);
    await expect(page.locator("main h1")).toContainText("Dashboard");
  });

  test("Italian landing page shows translated content", async ({ page }) => {
    await page.goto("/it");
    await expect(page.locator("main").getByText("Vai alla Dashboard")).toBeVisible();
    await expect(page.locator("main").getByText("Vedi i Workflow")).toBeVisible();
  });

  test("Italian connectors page shows translated UI", async ({ page }) => {
    await page.goto("/it/connectors");
    await expect(page.locator("main h1")).toContainText("Connettori");
    await expect(page.locator("main").getByText("Tutti")).toBeVisible();
  });

  test("Italian templates page shows translated names", async ({ page }) => {
    await page.goto("/it/templates");
    await expect(page.locator("main h1")).toContainText("Template");
    await expect(page.locator("main").getByText("Onboarding Dipendenti")).toBeVisible({ timeout: 10000 });
  });

  test("switching back to English restores content", async ({ page }) => {
    await page.goto("/it");
    await expect(page.locator("main").getByText("Vai alla Dashboard")).toBeVisible();

    await page.locator("aside").getByRole("link", { name: "English" }).click();
    await page.waitForLoadState("networkidle");
    await expect(page.locator("main").getByText("Go to Dashboard")).toBeVisible();
  });

  test("Italian compliance page shows translated title", async ({ page }) => {
    await page.goto("/it/compliance");
    await expect(page.locator("main h1")).toContainText("Conformit");
  });

  test("Italian security page shows translated title", async ({ page }) => {
    await page.goto("/it/security");
    await expect(page.locator("main h1")).toContainText("Sicurezza");
  });
});
