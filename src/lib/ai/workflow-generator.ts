import Anthropic from "@anthropic-ai/sdk";

const STEP_TYPES = [
  "SCRIPT", "HTTP_REQUEST", "EMAIL_NOTIFICATION", "APPROVAL",
  "CONDITION", "DELAY", "CREATE_USER", "DISABLE_USER",
  "INSTALL_SOFTWARE", "RUN_COMMAND", "CONNECTOR_ACTION",
] as const;

const CONNECTORS = [
  { id: "slack", actions: ["send-message", "create-channel"] },
  { id: "jira", actions: ["create-issue", "update-status", "add-comment"] },
  { id: "ldap", actions: ["create-user", "disable-user", "search-users"] },
];

interface GeneratedWorkflow {
  name: string;
  description: string;
  nodes: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    data: { label: string; type: string; config: Record<string, unknown> };
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    animated: boolean;
  }>;
}

const SYSTEM_PROMPT = `You are an IT automation workflow generator. Given a natural language description, generate a workflow as JSON.

Available step types: ${STEP_TYPES.join(", ")}

Available connectors:
${CONNECTORS.map((c) => `- ${c.id}: ${c.actions.join(", ")}`).join("\n")}

For CONNECTOR_ACTION steps, include connectorId and actionId in the config.

Respond ONLY with valid JSON matching this schema:
{
  "name": "Workflow Name",
  "description": "Brief description",
  "nodes": [
    {
      "id": "s1",
      "type": "step",
      "position": { "x": 250, "y": 0 },
      "data": { "label": "Step Name", "type": "STEP_TYPE", "config": {} }
    }
  ],
  "edges": [
    { "id": "e1-2", "source": "s1", "target": "s2", "animated": true }
  ]
}

Position nodes vertically with 120px spacing. Use meaningful step labels. Keep workflows practical (3-8 steps).`;

export async function generateWorkflow(prompt: string): Promise<GeneratedWorkflow> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return generateFallback(prompt);
  }

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error("Failed to parse AI response");
  }

  return JSON.parse(jsonMatch[0]) as GeneratedWorkflow;
}

function generateFallback(prompt: string): GeneratedWorkflow {
  const lower = prompt.toLowerCase();
  const nodes: GeneratedWorkflow["nodes"] = [];
  const edges: GeneratedWorkflow["edges"] = [];
  let y = 0;
  let stepNum = 0;

  function addStep(label: string, type: string, config: Record<string, unknown> = {}) {
    stepNum++;
    const id = `s${stepNum}`;
    nodes.push({ id, type: "step", position: { x: 250, y }, data: { label, type, config } });
    if (stepNum > 1) {
      edges.push({ id: `e${stepNum - 1}-${stepNum}`, source: `s${stepNum - 1}`, target: id, animated: true });
    }
    y += 120;
  }

  if (lower.includes("onboard") || lower.includes("new hire") || lower.includes("nuovo dipendente") || lower.includes("assunzione")) {
    addStep("Create AD Account", "CREATE_USER", { department: "{{department}}" });
    addStep("Provision Software", "INSTALL_SOFTWARE", { packages: ["office365", "slack"] });
    addStep("Notify Team", "CONNECTOR_ACTION", { connectorId: "slack", actionId: "send-message", channel: "#new-hires" });
    addStep("Create Onboarding Ticket", "CONNECTOR_ACTION", { connectorId: "jira", actionId: "create-issue" });
    addStep("Manager Approval", "APPROVAL", {});
  } else if (lower.includes("offboard") || lower.includes("dismiss") || lower.includes("licenziamento") || lower.includes("uscita")) {
    addStep("Disable AD Account", "DISABLE_USER", {});
    addStep("Revoke Access", "RUN_COMMAND", { command: "revoke-all-access --user {{username}}" });
    addStep("Transfer Data", "SCRIPT", { script: "transfer-data.sh" });
    addStep("Notify HR", "CONNECTOR_ACTION", { connectorId: "slack", actionId: "send-message", channel: "#hr" });
  } else if (lower.includes("patch") || lower.includes("update") || lower.includes("aggiornamento")) {
    addStep("Scan for Updates", "RUN_COMMAND", { command: "scan-patches" });
    addStep("Test in Staging", "RUN_COMMAND", { command: "deploy-patches --env staging" });
    addStep("Approval", "APPROVAL", {});
    addStep("Deploy to Production", "RUN_COMMAND", { command: "deploy-patches --env production" });
    addStep("Notify Team", "CONNECTOR_ACTION", { connectorId: "slack", actionId: "send-message", channel: "#ops" });
  } else if (lower.includes("backup") || lower.includes("ripristino")) {
    addStep("Check Backup Status", "RUN_COMMAND", { command: "check-backups" });
    addStep("Verify Integrity", "SCRIPT", { script: "verify-integrity.sh" });
    addStep("Test Restore", "RUN_COMMAND", { command: "test-restore" });
    addStep("Alert on Failure", "CONNECTOR_ACTION", { connectorId: "slack", actionId: "send-message", channel: "#alerts" });
  } else if (lower.includes("notify") || lower.includes("notifica") || lower.includes("alert") || lower.includes("avviso")) {
    addStep("Prepare Message", "SCRIPT", { script: "prepare-notification.sh" });
    addStep("Send Slack Notification", "CONNECTOR_ACTION", { connectorId: "slack", actionId: "send-message", channel: "#general" });
    addStep("Send Email", "EMAIL_NOTIFICATION", { to: "{{recipients}}" });
  } else {
    addStep("Initialize", "SCRIPT", { script: "init.sh" });
    addStep("Execute Main Task", "RUN_COMMAND", { command: "{{command}}" });
    addStep("Verify", "SCRIPT", { script: "verify.sh" });
    addStep("Notify", "CONNECTOR_ACTION", { connectorId: "slack", actionId: "send-message", channel: "#ops" });
  }

  const name = prompt.length > 50 ? prompt.slice(0, 50) + "..." : prompt;

  return {
    name: name.charAt(0).toUpperCase() + name.slice(1),
    description: `Auto-generated workflow: ${prompt}`,
    nodes,
    edges,
  };
}
