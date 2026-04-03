import type { Page } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

export async function loginAsTestUser(page: Page): Promise<void> {
  const email = `e2e-helper-${Date.now()}@example.com`;

  // Register via API to get cookies
  const res = await page.request.post(`${BASE_URL}/api/auth`, {
    data: {
      action: "register",
      email,
      password: "TestPass123!",
      name: "Test User",
      organizationName: `Test Org ${Date.now()}`,
    },
  });

  // Extract cookies from response and set them in the browser
  const cookies = res.headers()["set-cookie"];
  if (cookies) {
    const cookieEntries = cookies.split(/,(?=\s*\w+=)/).map((c) => {
      const [nameValue] = c.trim().split(";");
      const [name, value] = nameValue.split("=");
      return { name: name.trim(), value: value.trim(), url: BASE_URL };
    });
    await page.context().addCookies(cookieEntries);
  }
}
