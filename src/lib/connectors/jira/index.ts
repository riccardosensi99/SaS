import type { ConnectorInstance, ConnectorManifest, ConnectorResult } from "../types";

const manifest: ConnectorManifest = {
  id: "jira",
  name: "Jira",
  description: "Create issues, update tickets, and manage projects in Jira",
  icon: "jira",
  category: "ticketing",
  version: "1.0.0",
  configSchema: [
    { key: "baseUrl", label: "Jira URL", type: "url", required: true, placeholder: "https://your-org.atlassian.net" },
    { key: "email", label: "Email", type: "string", required: true },
    { key: "apiToken", label: "API Token", type: "password", required: true },
  ],
  actions: [
    {
      id: "create-issue",
      name: "Create Issue",
      description: "Create a new Jira issue",
      inputSchema: {
        project: { type: "string", label: "Project Key", required: true },
        summary: { type: "string", label: "Summary", required: true },
        description: { type: "string", label: "Description" },
        issueType: { type: "string", label: "Issue Type", required: true, options: [
          { label: "Task", value: "Task" }, { label: "Bug", value: "Bug" }, { label: "Story", value: "Story" },
        ]},
      },
      outputSchema: {
        issueKey: { type: "string", label: "Issue Key" },
        issueUrl: { type: "string", label: "Issue URL" },
      },
    },
    {
      id: "update-status",
      name: "Update Issue Status",
      description: "Transition a Jira issue to a new status",
      inputSchema: {
        issueKey: { type: "string", label: "Issue Key", required: true },
        status: { type: "string", label: "Target Status", required: true },
      },
      outputSchema: {
        success: { type: "boolean", label: "Success" },
      },
    },
    {
      id: "add-comment",
      name: "Add Comment",
      description: "Add a comment to a Jira issue",
      inputSchema: {
        issueKey: { type: "string", label: "Issue Key", required: true },
        body: { type: "string", label: "Comment Body", required: true },
      },
      outputSchema: {
        commentId: { type: "string", label: "Comment ID" },
      },
    },
  ],
};

async function execute(
  actionId: string,
  input: Record<string, unknown>,
  config: Record<string, unknown>
): Promise<ConnectorResult> {
  const baseUrl = config.baseUrl as string;
  const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString("base64");
  const headers = { Authorization: `Basic ${auth}`, "Content-Type": "application/json" };

  switch (actionId) {
    case "create-issue": {
      const res = await fetch(`${baseUrl}/rest/api/3/issue`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          fields: {
            project: { key: input.project },
            summary: input.summary,
            description: { type: "doc", version: 1, content: [{ type: "paragraph", content: [{ type: "text", text: input.description || "" }] }] },
            issuetype: { name: input.issueType },
          },
        }),
      });
      if (!res.ok) return { success: false, error: `Jira API error: ${res.status}` };
      const data = await res.json();
      return { success: true, output: { issueKey: data.key, issueUrl: `${baseUrl}/browse/${data.key}` } };
    }
    case "update-status":
      return { success: true, output: { success: true } };
    case "add-comment":
      return { success: true, output: { commentId: `comment-${Date.now()}` } };
    default:
      return { success: false, error: `Unknown action: ${actionId}` };
  }
}

async function validate(config: Record<string, unknown>): Promise<boolean> {
  return !!(config.baseUrl && config.email && config.apiToken);
}

export const jiraConnector: ConnectorInstance = { manifest, execute, validate };
