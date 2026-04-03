import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  const testEmail = `e2e-auth-${Date.now()}@example.com`;

  test("unauthenticated user is redirected to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("login page renders with form fields", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("main h1")).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in|accedi/i })).toBeVisible();
  });

  test("login page has link to register", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("link", { name: /sign up|registrati/i })).toBeVisible();
  });

  test("register page renders with all fields", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator("main h1")).toBeVisible();
    await expect(page.getByLabel(/name|nome/i).first()).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByLabel(/organization|organizzazione/i)).toBeVisible();
  });

  test("register page has link to login", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByRole("link", { name: /sign in|accedi/i })).toBeVisible();
  });

  test("successful registration redirects to dashboard", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel(/name|nome/i).first().fill("E2E Test User");
    await page.getByLabel(/email/i).fill(testEmail);
    await page.getByLabel(/password/i).fill("TestPass123!");
    await page.getByLabel(/organization|organizzazione/i).fill("E2E Test Org");
    await page.getByRole("button", { name: /create account|crea account/i }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  });

  test("login with valid credentials redirects to dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill(testEmail);
    await page.getByLabel(/password/i).fill("TestPass123!");
    await page.getByRole("button", { name: /sign in|accedi/i }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  });

  test("login with wrong password shows error", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill(testEmail);
    await page.getByLabel(/password/i).fill("WrongPassword");
    await page.getByRole("button", { name: /sign in|accedi/i }).click();

    await expect(page.getByText(/invalid|error|errore|credenziali/i)).toBeVisible({ timeout: 5000 });
  });

  test("authenticated user sees profile in sidebar", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill(testEmail);
    await page.getByLabel(/password/i).fill("TestPass123!");
    await page.getByRole("button", { name: /sign in|accedi/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    await expect(page.getByText("E2E Test User")).toBeVisible({ timeout: 5000 });
  });

  test("logout redirects to login page", async ({ page }) => {
    const logoutEmail = `e2e-logout-${Date.now()}@example.com`;

    // Register fresh user
    await page.goto("/register");
    await page.getByLabel(/name|nome/i).first().fill("Logout Tester");
    await page.getByLabel(/email/i).fill(logoutEmail);
    await page.getByLabel(/password/i).fill("TestPass123!");
    await page.getByLabel(/organization|organizzazione/i).fill("Logout Org");
    await page.getByRole("button", { name: /create account|crea account/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    // Logout via direct navigation (same as clicking the link)
    await page.goto("/api/auth/logout");
    await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
  });

  test("Italian login page shows translated content", async ({ page }) => {
    await page.goto("/it/login");
    await expect(page.locator("main h1")).toContainText(/accedi/i);
  });
});
