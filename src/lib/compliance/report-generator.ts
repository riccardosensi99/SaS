import type { ComplianceFramework, ComplianceControl } from "./frameworks";

export interface ComplianceReport {
  framework: ComplianceFramework;
  generatedAt: string;
  controls: Array<ComplianceControl & { evidence: number }>;
  summary: {
    total: number;
    enforced: number;
    partial: number;
    gap: number;
    score: number;
  };
}

export function generateReport(
  framework: ComplianceFramework,
  auditCounts: Record<string, number>
): ComplianceReport {
  const controls = framework.controls.map((control) => {
    const evidence = control.auditActions.reduce(
      (sum, action) => sum + (auditCounts[action] || 0),
      0
    );
    const status: ComplianceControl["status"] =
      evidence === 0 ? "gap" : evidence < 3 ? "partial" : "enforced";

    return { ...control, evidence, status };
  });

  const total = controls.length;
  const enforced = controls.filter((c) => c.status === "enforced").length;
  const partial = controls.filter((c) => c.status === "partial").length;
  const gap = controls.filter((c) => c.status === "gap").length;
  const score = total > 0 ? Math.round(((enforced + partial * 0.5) / total) * 100) : 0;

  return {
    framework,
    generatedAt: new Date().toISOString(),
    controls,
    summary: { total, enforced, partial, gap, score },
  };
}

export function reportToCSV(report: ComplianceReport): string {
  const header = "Control ID,Control Name,Category,Status,Evidence Count";
  const rows = report.controls.map(
    (c) => `${c.id},"${c.name}",${c.category},${c.status},${c.evidence}`
  );
  return [header, ...rows].join("\n");
}
