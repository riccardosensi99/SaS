import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getFramework } from "@/lib/compliance/frameworks";
import { generateReport, reportToCSV } from "@/lib/compliance/report-generator";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { frameworkId, organizationId, format = "json" } = body;

  if (!frameworkId) {
    return NextResponse.json({ error: "frameworkId is required" }, { status: 400 });
  }

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

  if (format === "csv") {
    const csv = reportToCSV(report);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${framework.id}-compliance-report.csv"`,
      },
    });
  }

  return NextResponse.json({ report });
}
