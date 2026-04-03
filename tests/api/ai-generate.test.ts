import { apiPost } from "./helpers";

describe("POST /api/ai/generate", () => {
  describe("action: generate", () => {
    it("should generate a workflow from a prompt", async () => {
      const res = await apiPost<{
        workflow: { name: string; nodes: unknown[]; edges: unknown[] };
      }>("/api/ai/generate", {
        action: "generate",
        prompt: "onboard a new employee",
      });

      expect(res.status).toBe(200);
      expect(res.data.workflow).toHaveProperty("name");
      expect(res.data.workflow).toHaveProperty("nodes");
      expect(res.data.workflow).toHaveProperty("edges");
      expect(res.data.workflow.nodes.length).toBeGreaterThan(0);
    });

    it("should reject empty prompt", async () => {
      const res = await apiPost("/api/ai/generate", {
        action: "generate",
        prompt: "",
      });

      expect(res.status).toBe(400);
    });

    it("should reject missing prompt", async () => {
      const res = await apiPost("/api/ai/generate", {
        action: "generate",
      });

      expect(res.status).toBe(400);
    });
  });

  describe("action: analyze", () => {
    it("should analyze a workflow", async () => {
      const res = await apiPost<{
        analysis: { score: number; summary: string; suggestions: unknown[] };
      }>("/api/ai/generate", {
        action: "analyze",
        nodes: [
          { id: "s1", data: { label: "Step 1", type: "SCRIPT", config: {} } },
          { id: "s2", data: { label: "Step 2", type: "RUN_COMMAND", config: {} } },
        ],
        edges: [{ source: "s1", target: "s2" }],
      });

      expect(res.status).toBe(200);
      expect(res.data.analysis).toHaveProperty("score");
      expect(res.data.analysis).toHaveProperty("summary");
      expect(typeof res.data.analysis.score).toBe("number");
    });

    it("should reject missing nodes", async () => {
      const res = await apiPost("/api/ai/generate", {
        action: "analyze",
      });

      expect(res.status).toBe(400);
    });
  });

  describe("action: explain", () => {
    it("should explain workflow steps", async () => {
      const res = await apiPost<{ explanations: string[] }>("/api/ai/generate", {
        action: "explain",
        nodes: [
          { id: "s1", data: { label: "Send Alert", type: "CONNECTOR_ACTION", config: { connectorId: "slack", actionId: "send-message" } } },
        ],
      });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.explanations)).toBe(true);
      expect(res.data.explanations.length).toBe(1);
      expect(res.data.explanations[0]).toContain("slack");
    });
  });

  it("should reject unknown action", async () => {
    const res = await apiPost("/api/ai/generate", { action: "unknown" });

    expect(res.status).toBe(400);
  });
});
