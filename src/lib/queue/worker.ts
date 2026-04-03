import { Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { getConnector } from "../connectors/registry";

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

interface WorkflowJobData {
  executionId: string;
  workflowId: string;
  organizationId: string;
  steps: Array<{
    id: string;
    type: string;
    config: Record<string, unknown>;
    order: number;
  }>;
}

async function executeStep(step: WorkflowJobData["steps"][number]): Promise<{
  stepId: string;
  status: "completed" | "failed";
  output?: unknown;
  error?: string;
}> {
  console.log(`Executing step: ${step.id} (${step.type})`);

  switch (step.type) {
    case "SCRIPT":
      return { stepId: step.id, status: "completed", output: { message: "Script executed" } };

    case "HTTP_REQUEST": {
      const { url, method, headers, body } = step.config as {
        url: string;
        method: string;
        headers?: Record<string, string>;
        body?: string;
      };
      const response = await fetch(url, { method, headers, body });
      return {
        stepId: step.id,
        status: response.ok ? "completed" : "failed",
        output: { statusCode: response.status },
        error: response.ok ? undefined : `HTTP ${response.status}`,
      };
    }

    case "EMAIL_NOTIFICATION":
      return { stepId: step.id, status: "completed", output: { message: "Email sent (stub)" } };

    case "DELAY": {
      const delayMs = (step.config as { delayMs: number }).delayMs || 1000;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return { stepId: step.id, status: "completed", output: { delayed: delayMs } };
    }

    case "CONDITION":
      return { stepId: step.id, status: "completed", output: { evaluated: true } };

    case "CREATE_USER":
    case "DISABLE_USER":
    case "INSTALL_SOFTWARE":
    case "RUN_COMMAND":
      return {
        stepId: step.id,
        status: "completed",
        output: { message: `${step.type} executed (stub)` },
      };

    case "CONNECTOR_ACTION": {
      const { connectorId, actionId, credentials, ...actionInput } = step.config as {
        connectorId: string; actionId: string; credentials: Record<string, unknown>;
      };
      const connector = getConnector(connectorId);
      if (!connector) return { stepId: step.id, status: "failed", error: `Connector not found: ${connectorId}` };
      const result = await connector.execute(actionId, actionInput, credentials || {});
      return {
        stepId: step.id,
        status: result.success ? "completed" : "failed",
        output: result.output,
        error: result.error,
      };
    }

    default:
      return { stepId: step.id, status: "failed", error: `Unknown step type: ${step.type}` };
  }
}

const worker = new Worker<WorkflowJobData>(
  "workflow-execution",
  async (job: Job<WorkflowJobData>) => {
    const { executionId, steps } = job.data;
    console.log(`Starting workflow execution: ${executionId}`);

    const sortedSteps = [...steps].sort((a, b) => a.order - b.order);
    const results: Awaited<ReturnType<typeof executeStep>>[] = [];

    for (const step of sortedSteps) {
      const result = await executeStep(step);
      results.push(result);

      if (result.status === "failed") {
        console.error(`Step ${step.id} failed: ${result.error}`);
        throw new Error(`Step ${step.id} failed: ${result.error}`);
      }

      await job.updateProgress(Math.round(((sortedSteps.indexOf(step) + 1) / sortedSteps.length) * 100));
    }

    console.log(`Workflow execution ${executionId} completed`);
    return { executionId, results };
  },
  {
    connection,
    concurrency: 5,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed for execution ${job.data.executionId}`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});

console.log("Workflow worker started. Waiting for jobs...");
