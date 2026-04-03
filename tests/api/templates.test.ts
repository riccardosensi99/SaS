import { apiGet, apiPost } from "./helpers";

describe("/api/templates", () => {
  describe("GET /api/templates", () => {
    it("should list all templates", async () => {
      const res = await apiGet<{ templates: Array<{ id: string; category: string }> }>(
        "/api/templates"
      );

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.templates)).toBe(true);
      expect(res.data.templates.length).toBeGreaterThanOrEqual(5);
    });

    it("should filter by category", async () => {
      const res = await apiGet<{ templates: Array<{ category: string }> }>(
        "/api/templates?category=hr"
      );

      expect(res.status).toBe(200);
      for (const t of res.data.templates) {
        expect(t.category).toBe("hr");
      }
    });

    it("should include security playbooks", async () => {
      const res = await apiGet<{ templates: Array<{ id: string }> }>(
        "/api/templates?category=security"
      );

      expect(res.status).toBe(200);
      const ids = res.data.templates.map((t) => t.id);
      expect(ids).toContain("security-ransomware-response");
      expect(ids).toContain("security-phishing-containment");
    });

    it("should get template by id", async () => {
      const res = await apiGet<{ template: { id: string; name: string } }>(
        "/api/templates?id=employee-onboarding"
      );

      expect(res.status).toBe(200);
      expect(res.data.template.id).toBe("employee-onboarding");
    });

    it("should return 404 for unknown template", async () => {
      const res = await apiGet("/api/templates?id=nonexistent");

      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/templates (import)", () => {
    it("should import a template as a workflow", async () => {
      const res = await apiPost<{ workflow: { id: string; name: string } }>(
        "/api/templates",
        { templateId: "employee-onboarding" }
      );

      expect(res.status).toBe(201);
      expect(res.data.workflow).toHaveProperty("id");
      expect(res.data.workflow.name).toBe("Employee Onboarding");
    });

    it("should import with custom name", async () => {
      const res = await apiPost<{ workflow: { name: string } }>("/api/templates", {
        templateId: "employee-onboarding",
        name: "Custom Onboarding",
      });

      expect(res.status).toBe(201);
      expect(res.data.workflow.name).toBe("Custom Onboarding");
    });

    it("should reject missing templateId", async () => {
      const res = await apiPost("/api/templates", {});

      expect(res.status).toBe(400);
    });

    it("should reject unknown templateId", async () => {
      const res = await apiPost("/api/templates", { templateId: "nonexistent" });

      expect(res.status).toBe(404);
    });
  });
});
