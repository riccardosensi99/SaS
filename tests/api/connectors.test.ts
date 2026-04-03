import { apiGet, apiPost, apiDelete } from "./helpers";

describe("/api/connectors", () => {
  describe("GET /api/connectors", () => {
    it("should list available connectors", async () => {
      const res = await apiGet<{ connectors: Array<{ id: string; name: string }> }>(
        "/api/connectors"
      );

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.connectors)).toBe(true);
      expect(res.data.connectors.length).toBeGreaterThanOrEqual(3);

      const ids = res.data.connectors.map((c) => c.id);
      expect(ids).toContain("slack");
      expect(ids).toContain("jira");
      expect(ids).toContain("ldap");
    });

    it("should include connector actions", async () => {
      const res = await apiGet<{ connectors: Array<{ actions: unknown[] }> }>(
        "/api/connectors"
      );

      for (const connector of res.data.connectors) {
        expect(Array.isArray(connector.actions)).toBe(true);
        expect(connector.actions.length).toBeGreaterThan(0);
      }
    });
  });

  describe("POST /api/connectors", () => {
    it("should reject missing fields", async () => {
      const res = await apiPost("/api/connectors", { connectorId: "slack" });

      expect(res.status).toBe(400);
    });

    it("should reject unknown connector", async () => {
      const res = await apiPost("/api/connectors", {
        connectorId: "nonexistent",
        organizationId: "test-org",
        credentials: { token: "abc" },
      });

      expect(res.status).toBe(404);
    });

    it("should reject invalid credentials", async () => {
      const res = await apiPost("/api/connectors", {
        connectorId: "slack",
        organizationId: "test-org",
        credentials: { invalid: true },
      });

      expect(res.status).toBe(422);
    });
  });
});
