import { apiPost } from "./helpers";

describe("Auth Cookie Flow", () => {
  const testEmail = `auth-cookie-${Date.now()}@example.com`;

  it("POST /api/auth register should set httpOnly cookies", async () => {
    const res = await fetch("http://localhost:3000/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "register",
        email: testEmail,
        password: "TestPass123!",
        name: "Cookie Test",
        organizationName: `Cookie Org ${Date.now()}`,
      }),
    });

    expect(res.status).toBe(200);

    const cookies = res.headers.get("set-cookie");
    expect(cookies).toBeTruthy();
    expect(cookies).toContain("accessToken=");
    expect(cookies).toContain("HttpOnly");
  });

  it("POST /api/auth login should set httpOnly cookies", async () => {
    const res = await fetch("http://localhost:3000/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "login",
        email: testEmail,
        password: "TestPass123!",
      }),
    });

    expect(res.status).toBe(200);

    const cookies = res.headers.get("set-cookie");
    expect(cookies).toBeTruthy();
    expect(cookies).toContain("accessToken=");
    expect(cookies).toContain("refreshToken=");
  });

  it("POST /api/auth logout should clear cookies", async () => {
    const res = await fetch("http://localhost:3000/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });

    expect(res.status).toBe(200);

    const cookies = res.headers.get("set-cookie");
    expect(cookies).toBeTruthy();
    // Cleared cookies have Max-Age=0 or expires in the past
    expect(cookies).toContain("accessToken=");
    expect(cookies).toContain("Max-Age=0");
  });

  it("GET /api/auth/me without cookie should return 401", async () => {
    const res = await fetch("http://localhost:3000/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("GET /api/auth/me with valid cookie should return user", async () => {
    // Login first to get cookie
    const loginRes = await fetch("http://localhost:3000/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "login",
        email: testEmail,
        password: "TestPass123!",
      }),
    });

    const setCookie = loginRes.headers.get("set-cookie") || "";
    // Extract just the accessToken cookie
    const accessTokenMatch = setCookie.match(/accessToken=([^;]+)/);
    const cookie = accessTokenMatch ? `accessToken=${accessTokenMatch[1]}` : "";

    const res = await fetch("http://localhost:3000/api/auth/me", {
      headers: { Cookie: cookie },
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("user");
    expect(data.user.email).toBe(testEmail);
    expect(data).toHaveProperty("organization");
  });
});
