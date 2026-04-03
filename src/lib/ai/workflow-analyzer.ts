interface WorkflowNode {
  id: string;
  data: { label: string; type: string; config: Record<string, unknown> };
}

interface WorkflowEdge {
  source: string;
  target: string;
}

interface AnalysisResult {
  suggestions: Suggestion[];
  score: number;
  summary: string;
}

interface Suggestion {
  type: "warning" | "improvement" | "info";
  message: string;
  stepId?: string;
}

export function analyzeWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): AnalysisResult {
  const suggestions: Suggestion[] = [];
  let score = 100;

  // Check for disconnected nodes
  const connectedNodeIds = new Set<string>();
  for (const edge of edges) {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  }
  for (const node of nodes) {
    if (nodes.length > 1 && !connectedNodeIds.has(node.id)) {
      suggestions.push({
        type: "warning",
        message: `Step "${node.data.label}" is disconnected from the workflow`,
        stepId: node.id,
      });
      score -= 15;
    }
  }

  // Check for missing approval before destructive actions
  const destructiveTypes = ["DISABLE_USER", "RUN_COMMAND"];
  for (const node of nodes) {
    if (destructiveTypes.includes(node.data.type)) {
      const incomingEdges = edges.filter((e) => e.target === node.id);
      const predecessorIds = incomingEdges.map((e) => e.source);
      const predecessors = nodes.filter((n) => predecessorIds.includes(n.id));
      const hasApproval = predecessors.some((p) => p.data.type === "APPROVAL");

      if (!hasApproval) {
        suggestions.push({
          type: "improvement",
          message: `Consider adding an approval step before "${node.data.label}" — it performs a destructive action`,
          stepId: node.id,
        });
        score -= 5;
      }
    }
  }

  // Check for notification at the end
  const terminalNodes = nodes.filter(
    (n) => !edges.some((e) => e.source === n.id)
  );
  const hasNotification = terminalNodes.some(
    (n) => n.data.type === "EMAIL_NOTIFICATION" || n.data.type === "CONNECTOR_ACTION"
  );
  if (!hasNotification && nodes.length > 2) {
    suggestions.push({
      type: "improvement",
      message: "Consider adding a notification step at the end to inform stakeholders of completion",
    });
    score -= 5;
  }

  // Check for empty workflow
  if (nodes.length === 0) {
    suggestions.push({ type: "warning", message: "Workflow has no steps" });
    score = 0;
  }

  // Check for single step
  if (nodes.length === 1) {
    suggestions.push({
      type: "info",
      message: "Single-step workflow — consider if this needs to be a workflow or a simple action",
    });
  }

  // Check for error handling
  const hasCondition = nodes.some((n) => n.data.type === "CONDITION");
  if (nodes.length > 3 && !hasCondition) {
    suggestions.push({
      type: "info",
      message: "Consider adding condition steps for error handling or branching logic",
    });
  }

  score = Math.max(0, Math.min(100, score));

  const summary =
    score >= 90 ? "Workflow looks great!" :
    score >= 70 ? "Workflow is good but has room for improvement." :
    score >= 50 ? "Workflow needs some attention." :
    "Workflow has significant issues to address.";

  return { suggestions, score, summary };
}

export function explainStep(node: WorkflowNode): string {
  const { label, type, config } = node.data;

  const explanations: Record<string, () => string> = {
    SCRIPT: () => `Runs a script${config.script ? ` (${config.script})` : ""}`,
    HTTP_REQUEST: () => `Makes an HTTP request${config.url ? ` to ${config.url}` : ""}`,
    EMAIL_NOTIFICATION: () => `Sends an email notification${config.to ? ` to ${config.to}` : ""}`,
    APPROVAL: () => `Waits for approval${config.approver ? ` from ${config.approver}` : ""}`,
    CONDITION: () => `Evaluates a condition to determine the next step`,
    DELAY: () => `Pauses execution${config.delayMs ? ` for ${Number(config.delayMs) / 1000}s` : ""}`,
    CREATE_USER: () => `Creates a new user account${config.department ? ` in ${config.department}` : ""}`,
    DISABLE_USER: () => `Disables a user account`,
    INSTALL_SOFTWARE: () => `Installs software${config.packages ? `: ${(config.packages as string[]).join(", ")}` : ""}`,
    RUN_COMMAND: () => `Executes a command${config.command ? `: ${config.command}` : ""}`,
    CONNECTOR_ACTION: () => {
      const connector = config.connectorId || "unknown";
      const action = config.actionId || "unknown";
      return `Uses ${connector} connector to ${String(action).replace(/-/g, " ")}`;
    },
  };

  const explain = explanations[type];
  return explain ? `**${label}**: ${explain()}` : `**${label}**: Performs a ${type} operation`;
}
