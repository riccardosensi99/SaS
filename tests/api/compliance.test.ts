import { apiGet, apiPost } from "./helpers";

describe("/api/compliance", () => {
  describe("GET /api/compliance", () => {
    it("should list all frameworks with scores", async () => {
      const res = await apiGet<{
        frameworks: Array<{ id: string; name: string; score: number; controls: object }>;
      }>("/api/compliance");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.frameworks)).toBe(true);
      expect(res.data.frameworks.length).toBe(4);

      const ids = res.data.frameworks.map((f) => f.id);
      expect(ids).toContain("soc2");
      expect(ids).toContain("gdpr");
      expect(ids).toContain("hipaa");
      expect(ids).toContain("pci-dss");
    });

    it("should include score for each framework", async () => {
      const res = await apiGet<{ frameworks: Array<{ score: number }> }>("/api/compliance");

      for (const fw of res.data.frameworks) {
        expect(typeof fw.score).toBe("number");
        expect(fw.score).toBeGreaterThanOrEqual(0);
        expect(fw.score).toBeLessThanOrEqual(100);
      }
    });

    it("should return detailed report for a framework", async () => {
      const res = await apiGet<{
        report: { framework: object; controls: unknown[]; summary: { score: number } };
      }>("/api/compliance?framework=soc2");

      expect(res.status).toBe(200);
      expect(res.data.report).toHaveProperty("framework");
      expect(res.data.report).toHaveProperty("controls");
      expect(res.data.report).toHaveProperty("summary");
      expect(Array.isArray(res.data.report.controls)).toBe(true);
    });

    it("should return 404 for unknown framework", async () => {
      const res = await apiGet("/api/compliance?framework=nonexistent");

      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/compliance/reports", () => {
    it("should generate JSON report", async () => {
      const res = await apiPost<{ report: object }>("/api/compliance/reports", {
        frameworkId: "gdpr",
        format: "json",
      });

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty("report");
    });

    it("should reject missing frameworkId", async () => {
      const res = await apiPost("/api/compliance/reports", {});

      expect(res.status).toBe(400);
    });

    it("should reject unknown framework", async () => {
      const res = await apiPost("/api/compliance/reports", {
        frameworkId: "nonexistent",
      });

      expect(res.status).toBe(404);
    });
  });
});
