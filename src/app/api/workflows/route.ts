import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Queue } from "bullmq";
import IORedis from "ioredis";

let workflowQueue: Queue | null = null;

function getQueue() {
  if (!workflowQueue) {
    const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
      maxRetriesPerRequest: null,
    });
    workflowQueue = new Queue("workflow-execution", { connection });
  }
  return workflowQueue;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const organizationId = searchParams.get("organizationId");

  if (id) {
    const workflow = await prisma.workflow.findUnique({
      where: { id },
      include: {
        steps: { orderBy: { order: "asc" } },
        executions: { orderBy: { createdAt: "desc" }, take: 10 },
        _count: { select: { executions: true, steps: true } },
      },
    });

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    return NextResponse.json({ workflow });
  }

  const where = organizationId ? { organizationId } : {};
  const workflows = await prisma.workflow.findMany({
    where,
    include: { _count: { select: { executions: true, steps: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ workflows });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, description, trigger, schedule, definition, steps, organizationId } = body;

  if (!name || !organizationId) {
    return NextResponse.json({ error: "Name and organizationId are required" }, { status: 400 });
  }

  const workflow = await prisma.workflow.create({
    data: {
      name,
      description,
      trigger: trigger || "MANUAL",
      schedule,
      definition: definition || { nodes: [], edges: [] },
      organizationId,
      steps: steps
        ? {
            create: steps.map(
              (
                step: { name: string; type: string; config: Record<string, unknown>; position: { x: number; y: number } },
                index: number
              ) => ({
                name: step.name,
                type: step.type,
                config: step.config || {},
                position: step.position || { x: 0, y: index * 100 },
                order: index,
              })
            ),
          }
        : undefined,
    },
    include: { steps: true },
  });

  return NextResponse.json({ workflow }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, action, ...updateData } = body;

  if (!id) {
    return NextResponse.json({ error: "Workflow ID is required" }, { status: 400 });
  }

  if (action === "execute") {
    const workflow = await prisma.workflow.findUnique({
      where: { id },
      include: { steps: { orderBy: { order: "asc" } } },
    });

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    const execution = await prisma.workflowExecution.create({
      data: {
        workflowId: workflow.id,
        organizationId: workflow.organizationId,
        status: "PENDING",
      },
    });

    try {
      const queue = getQueue();
      await queue.add(`exec-${execution.id}`, {
        executionId: execution.id,
        workflowId: workflow.id,
        organizationId: workflow.organizationId,
        steps: workflow.steps.map((s) => ({
          id: s.id,
          type: s.type,
          config: s.config,
          order: s.order,
        })),
      });
    } catch {
      await prisma.workflowExecution.update({
        where: { id: execution.id },
        data: { status: "FAILED", error: "Failed to queue execution" },
      });
    }

    return NextResponse.json({ execution });
  }

  const workflow = await prisma.workflow.update({
    where: { id },
    data: updateData,
    include: { steps: true },
  });

  return NextResponse.json({ workflow });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Workflow ID is required" }, { status: 400 });
  }

  await prisma.workflow.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
