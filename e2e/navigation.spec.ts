import { test, expect } from "@playwright/test";
import { loginAsTestUser } from "./helpers";

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test("sidebar links navigate to correct pages", async ({ page }) => {
    await page.goto("/dashboard");

    // Click Workflows in sidebar
    await page.locator("aside").getByRole("link", { name: /workflow/i }).click();
    await expect(page).toHaveURL(/\/workflow/);

    // Click Templates in sidebar
    await page.locator("aside").getByRole("link", { name: /template/i }).click();
    await expect(page).toHaveURL(/\/template/);

    // Click Connectors in sidebar
    await page.locator("aside").getByRole("link", { name: /connector/i }).click();
    await expect(page).toHaveURL(/\/connector/);

    // Click Dashboard in sidebar
    await page.locator("aside").getByRole("link", { name: /dashboard/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("landing page CTA buttons navigate correctly", async ({ page }) => {
    await page.goto("/");

    const dashboardLink = page.locator("main").getByRole("link", { name: /go to dashboard|vai alla dashboard/i });
    await expect(dashboardLink).toBeVisible();
    await dashboardLink.click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("compliance framework card navigates to detail page", async ({ page }) => {
    await page.goto("/compliance");
    await expect(page.locator("main").getByText("SOC 2").first()).toBeVisible({ timeout: 10000 });
    await page.locator("main").getByText("SOC 2").first().click();
    await expect(page).toHaveURL(/\/compliance\/soc2/);
  });

  test("security page switches between tabs", async ({ page }) => {
    await page.goto("/security");
    await expect(page.locator("main").getByRole("button", { name: /playbook/i })).toBeVisible();
    await page.locator("main").getByRole("button", { name: /incident/i }).click();
    await expect(page.locator("main").getByText(/incident|incidenti|no incident/i).first()).toBeVisible();
  });
});
