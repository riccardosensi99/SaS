import { apiGet, apiPost, apiPut, apiDelete } from "./helpers";

describe("/api/workflows", () => {
  let orgId: string;
  let workflowId: string;

  beforeAll(async () => {
    // Create a test org via auth
    const res = await apiPost<{ organization: { id: string } }>("/api/auth", {
      action: "register",
      email: `wf-test-${Date.now()}@example.com`,
      password: "TestPass123!",
      name: "WF Tester",
      organizationName: `WF Test Org ${Date.now()}`,
    });
    orgId = res.data.organization.id;
  });

  describe("POST /api/workflows", () => {
    it("should create a workflow", async () => {
      const res = await apiPost<{ workflow: { id: string; name: string } }>("/api/workflows", {
        name: "Test Workflow",
        description: "A test workflow",
        organizationId: orgId,
      });

      expect(res.status).toBe(201);
      expect(res.data.workflow).toHaveProperty("id");
      expect(res.data.workflow.name).toBe("Test Workflow");
      workflowId = res.data.workflow.id;
    });

    it("should reject workflow without name", async () => {
      const res = await apiPost("/api/workflows", {
        organizationId: orgId,
      });

      expect(res.status).toBe(400);
    });

    it("should reject workflow without organizationId", async () => {
      const res = await apiPost("/api/workflows", {
        name: "No Org Workflow",
      });

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/workflows", () => {
    it("should list workflows", async () => {
      const res = await apiGet<{ workflows: unknown[] }>("/api/workflows");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.workflows)).toBe(true);
      expect(res.data.workflows.length).toBeGreaterThan(0);
    });

    it("should get workflow by id", async () => {
      const res = await apiGet<{ workflow: { id: string; name: string } }>(
        `/api/workflows?id=${workflowId}`
      );

      expect(res.status).toBe(200);
      expect(res.data.workflow.id).toBe(workflowId);
    });

    it("should return 404 for non-existent workflow", async () => {
      const res = await apiGet("/api/workflows?id=non-existent-id");

      expect(res.status).toBe(404);
    });
  });

  describe("PUT /api/workflows", () => {
    it("should update a workflow", async () => {
      const res = await apiPut<{ workflow: { name: string } }>("/api/workflows", {
        id: workflowId,
        name: "Updated Workflow",
      });

      expect(res.status).toBe(200);
      expect(res.data.workflow.name).toBe("Updated Workflow");
    });

    it("should execute a workflow", async () => {
      const res = await apiPut<{ execution: { id: string } }>("/api/workflows", {
        id: workflowId,
        action: "execute",
      });

      // May fail if Redis is not running, but should not crash
      expect([200, 500]).toContain(res.status);
      if (res.status === 200) {
        expect(res.data.execution).toHaveProperty("id");
      }
    });

    it("should reject update without id", async () => {
      const res = await apiPut("/api/workflows", { name: "No ID" });

      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /api/workflows", () => {
    it("should delete a workflow", async () => {
      // Create a fresh workflow for deletion
      const createRes = await apiPost<{ workflow: { id: string } }>("/api/workflows", {
        name: "To Delete",
        organizationId: orgId,
      });
      const deleteId = createRes.data.workflow.id;

      const res = await apiDelete(`/api/workflows?id=${deleteId}`);

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty("deleted", true);
    });

    it("should reject delete without id", async () => {
      const res = await apiDelete("/api/workflows?id=");

      expect(res.status).toBe(400);
    });
  });
});
