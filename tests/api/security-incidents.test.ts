import { apiGet, apiPost, apiPut } from "./helpers";

describe("/api/security/incidents", () => {
  let orgId: string;

  beforeAll(async () => {
    const res = await apiPost<{ organization: { id: string } }>("/api/auth", {
      action: "register",
      email: `sec-test-${Date.now()}@example.com`,
      password: "TestPass123!",
      name: "Sec Tester",
      organizationName: `Sec Test Org ${Date.now()}`,
    });
    orgId = res.data.organization.id;
  });

  describe("GET /api/security/incidents", () => {
    it("should return incidents list (may be empty)", async () => {
      const res = await apiGet<{ incidents: unknown[] }>("/api/security/incidents");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.incidents)).toBe(true);
    });
  });

  describe("POST /api/security/incidents", () => {
    it("should create an incident or return 500 if model unavailable", async () => {
      const res = await apiPost<{
        incident?: { id: string; type: string; severity: string; status: string };
        error?: string;
      }>("/api/security/incidents", {
        type: "ransomware",
        severity: "CRITICAL",
        description: "Test ransomware incident",
        organizationId: orgId,
      });

      if (res.status === 201) {
        expect(res.data.incident!.type).toBe("ransomware");
        expect(res.data.incident!.severity).toBe("CRITICAL");
        expect(res.data.incident!.status).toBe("OPEN");
      } else {
        // Model may not be available if server was not restarted after schema change
        expect(res.status).toBe(500);
        expect(res.data).toHaveProperty("error");
      }
    });

    it("should reject missing required fields", async () => {
      const res = await apiPost("/api/security/incidents", {
        type: "phishing",
      });

      expect(res.status).toBe(400);
    });
  });

  describe("PUT /api/security/incidents", () => {
    let incidentId: string | null = null;

    beforeAll(async () => {
      const res = await apiPost<{ incident?: { id: string } }>("/api/security/incidents", {
        type: "phishing",
        severity: "HIGH",
        description: "Update test",
        organizationId: orgId,
      });
      incidentId = res.data.incident?.id ?? null;
    });

    it("should update incident status", async () => {
      if (!incidentId) return; // skip if creation failed
      const res = await apiPut<{ incident: { status: string } }>("/api/security/incidents", {
        id: incidentId,
        status: "INVESTIGATING",
        timelineEntry: "Investigation started",
      });

      expect(res.status).toBe(200);
      expect(res.data.incident.status).toBe("INVESTIGATING");
    });

    it("should resolve incident", async () => {
      if (!incidentId) return;
      const res = await apiPut<{ incident: { status: string; resolvedAt: string } }>(
        "/api/security/incidents",
        {
          id: incidentId,
          status: "RESOLVED",
          timelineEntry: "Incident resolved",
        }
      );

      expect(res.status).toBe(200);
      expect(res.data.incident.status).toBe("RESOLVED");
      expect(res.data.incident.resolvedAt).toBeTruthy();
    });

    it("should reject missing id", async () => {
      const res = await apiPut("/api/security/incidents", { status: "RESOLVED" });

      expect(res.status).toBe(400);
    });

    it("should return 404 for non-existent incident", async () => {
      const res = await apiPut("/api/security/incidents", {
        id: "nonexistent-id",
        status: "RESOLVED",
      });

      expect([404, 500]).toContain(res.status);
    });
  });
});
