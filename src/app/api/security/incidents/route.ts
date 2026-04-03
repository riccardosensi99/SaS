import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (organizationId) where.organizationId = organizationId;
  if (status) where.status = status;

  const incidents = await prisma.securityIncident.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ incidents });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { type, severity, description, playbookId, organizationId } = body;

  if (!type || !severity || !organizationId) {
    return NextResponse.json({ error: "type, severity, and organizationId required" }, { status: 400 });
  }

  // Resolve org
  let orgId = organizationId;
  const orgExists = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!orgExists) {
    const firstOrg = await prisma.organization.findFirst();
    if (firstOrg) {
      orgId = firstOrg.id;
    } else {
      const newOrg = await prisma.organization.create({ data: { name: "My Organization", slug: "my-org" } });
      orgId = newOrg.id;
    }
  }

  const incident = await prisma.securityIncident.create({
    data: {
      type,
      severity,
      description: description || "",
      playbookId: playbookId || null,
      status: "OPEN",
      organizationId: orgId,
      timeline: [{ action: "Incident created", timestamp: new Date().toISOString() }],
    },
  });

  return NextResponse.json({ incident }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, status, timelineEntry } = body;

  if (!id) {
    return NextResponse.json({ error: "Incident ID required" }, { status: 400 });
  }

  const existing = await prisma.securityIncident.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Incident not found" }, { status: 404 });
  }

  const currentTimeline = (existing.timeline as Array<{ action: string; timestamp: string }>) || [];
  const updatedTimeline = timelineEntry
    ? [...currentTimeline, { action: timelineEntry, timestamp: new Date().toISOString() }]
    : currentTimeline;

  const incident = await prisma.securityIncident.update({
    where: { id },
    data: {
      status: status || existing.status,
      timeline: updatedTimeline,
      resolvedAt: status === "RESOLVED" ? new Date() : undefined,
    },
  });

  return NextResponse.json({ incident });
}
