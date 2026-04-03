import { apiPost } from "./helpers";

describe("POST /api/auth", () => {
  const testEmail = `test-${Date.now()}@example.com`;

  it("should register a new user", async () => {
    const res = await apiPost("/api/auth", {
      action: "register",
      email: testEmail,
      password: "TestPass123!",
      name: "Test User",
      organizationName: "Test Org",
    });

    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty("user");
    expect(res.data).toHaveProperty("accessToken");
    expect(res.data).toHaveProperty("refreshToken");
    expect((res.data as { user: { email: string } }).user.email).toBe(testEmail);
  });

  it("should reject duplicate email registration", async () => {
    const res = await apiPost("/api/auth", {
      action: "register",
      email: testEmail,
      password: "TestPass123!",
      name: "Test User 2",
      organizationName: "Test Org 2",
    });

    expect(res.status).toBe(409);
    expect(res.data).toHaveProperty("error");
  });

  it("should reject registration with missing fields", async () => {
    const res = await apiPost("/api/auth", {
      action: "register",
      email: "incomplete@test.com",
    });

    expect(res.status).toBe(400);
    expect(res.data).toHaveProperty("error");
  });

  it("should login with valid credentials", async () => {
    const res = await apiPost("/api/auth", {
      action: "login",
      email: testEmail,
      password: "TestPass123!",
    });

    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty("accessToken");
    expect(res.data).toHaveProperty("refreshToken");
    expect(res.data).toHaveProperty("user");
    expect(res.data).toHaveProperty("organization");
  });

  it("should reject login with wrong password", async () => {
    const res = await apiPost("/api/auth", {
      action: "login",
      email: testEmail,
      password: "WrongPassword",
    });

    expect(res.status).toBe(401);
    expect(res.data).toHaveProperty("error");
  });

  it("should refresh token", async () => {
    const loginRes = await apiPost<{ refreshToken: string }>("/api/auth", {
      action: "login",
      email: testEmail,
      password: "TestPass123!",
    });

    const res = await apiPost("/api/auth", {
      action: "refresh",
      refreshToken: loginRes.data.refreshToken,
    });

    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty("accessToken");
    expect(res.data).toHaveProperty("refreshToken");
  });

  it("should reject invalid refresh token", async () => {
    const res = await apiPost("/api/auth", {
      action: "refresh",
      refreshToken: "invalid-token",
    });

    expect(res.status).toBe(401);
  });

  it("should reject unknown action", async () => {
    const res = await apiPost("/api/auth", { action: "unknown" });

    expect(res.status).toBe(400);
  });
});
