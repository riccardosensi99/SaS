import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { listTemplates, getTemplate } from "@/lib/templates";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const category = searchParams.get("category");

  if (id) {
    const template = getTemplate(id);
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
    return NextResponse.json({ template });
  }

  let templates = listTemplates();
  if (category) {
    templates = templates.filter((t) => t.category === category);
  }

  return NextResponse.json({ templates });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { templateId, organizationId: providedOrgId, name, description } = body;

  if (!templateId) {
    return NextResponse.json({ error: "templateId is required" }, { status: 400 });
  }

  const template = getTemplate(templateId);
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  // Resolve organization: use provided ID or find/create a default one
  let orgId = providedOrgId;
  if (!orgId) {
    const firstOrg = await prisma.organization.findFirst();
    if (firstOrg) {
      orgId = firstOrg.id;
    } else {
      const newOrg = await prisma.organization.create({
        data: { name: "My Organization", slug: "my-org" },
      });
      orgId = newOrg.id;
    }
  } else {
    const orgExists = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!orgExists) {
      const newOrg = await prisma.organization.create({
        data: { name: "My Organization", slug: orgId, id: orgId },
      });
      orgId = newOrg.id;
    }
  }

  try {
    const workflow = await prisma.workflow.create({
      data: {
        name: name || template.name,
        description: description || template.description,
        trigger: "MANUAL",
        definition: template.definition as object,
        organizationId: orgId,
        steps: {
          create: template.definition.nodes.map((node, index) => ({
            name: node.data.label,
            type: node.data.type as "SCRIPT" | "HTTP_REQUEST" | "EMAIL_NOTIFICATION" | "APPROVAL" | "CONDITION" | "DELAY" | "CREATE_USER" | "DISABLE_USER" | "INSTALL_SOFTWARE" | "RUN_COMMAND" | "CONNECTOR_ACTION",
            config: node.data.config as object,
            position: node.position as object,
            order: index,
          })),
        },
      },
      include: { steps: true },
    });

    return NextResponse.json({ workflow }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Failed to create workflow: ${message}` }, { status: 500 });
  }
}
