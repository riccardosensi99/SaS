import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { listConnectors, getConnector } from "@/lib/connectors/registry";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId");

  const available = listConnectors();

  if (!organizationId) {
    return NextResponse.json({ connectors: available });
  }

  const configs = await prisma.connectorConfig.findMany({
    where: { organizationId },
  });

  const configMap = new Map(configs.map((c) => [c.connectorId, c]));

  const enriched = available.map((connector) => ({
    ...connector,
    enabled: configMap.has(connector.id),
    configId: configMap.get(connector.id)?.id,
  }));

  return NextResponse.json({ connectors: enriched });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { connectorId, organizationId, credentials } = body;

  if (!connectorId || !organizationId || !credentials) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const connector = getConnector(connectorId);
  if (!connector) {
    return NextResponse.json({ error: "Connector not found" }, { status: 404 });
  }

  const isValid = await connector.validate(credentials);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid connector configuration" }, { status: 422 });
  }

  const existing = await prisma.connectorConfig.findFirst({
    where: { connectorId, organizationId },
  });

  if (existing) {
    const updated = await prisma.connectorConfig.update({
      where: { id: existing.id },
      data: { credentials },
    });
    return NextResponse.json({ config: updated });
  }

  const config = await prisma.connectorConfig.create({
    data: { connectorId, organizationId, credentials },
  });

  return NextResponse.json({ config }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Config ID required" }, { status: 400 });
  }

  await prisma.connectorConfig.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
