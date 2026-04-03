import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { frameworks, getFramework } from "@/lib/compliance/frameworks";
import { generateReport } from "@/lib/compliance/report-generator";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const frameworkId = searchParams.get("framework");
  const organizationId = searchParams.get("organizationId");

  if (frameworkId) {
    const framework = getFramework(frameworkId);
    if (!framework) {
      return NextResponse.json({ error: "Framework not found" }, { status: 404 });
    }

    const where = organizationId ? { organizationId } : {};
    const auditLogs = await prisma.auditLog.groupBy({
      by: ["action"],
      where,
      _count: { action: true },
    });

    const auditCounts: Record<string, number> = {};
    for (const log of auditLogs) {
      auditCounts[log.action] = log._count.action;
    }

    const report = generateReport(framework, auditCounts);
    return NextResponse.json({ report });
  }

  const summaries = await Promise.all(
    frameworks.map(async (fw) => {
      const where = organizationId ? { organizationId } : {};
      const auditLogs = await prisma.auditLog.groupBy({
        by: ["action"],
        where,
        _count: { action: true },
      });

      const auditCounts: Record<string, number> = {};
      for (const log of auditLogs) {
        auditCounts[log.action] = log._count.action;
      }

      const report = generateReport(fw, auditCounts);
      return {
        id: fw.id,
        name: fw.name,
        nameKey: fw.nameKey,
        description: fw.description,
        descriptionKey: fw.descriptionKey,
        score: report.summary.score,
        controls: report.summary,
      };
    })
  );

  return NextResponse.json({ frameworks: summaries });
}
