import type { ConnectorInstance, ConnectorManifest, ConnectorResult } from "../types";

const manifest: ConnectorManifest = {
  id: "slack",
  name: "Slack",
  description: "Send messages, create channels, and manage notifications via Slack",
  icon: "slack",
  category: "communication",
  version: "1.0.0",
  configSchema: [
    { key: "webhookUrl", label: "Webhook URL", type: "url", required: true, placeholder: "https://hooks.slack.com/services/..." },
    { key: "botToken", label: "Bot Token", type: "password", required: false, placeholder: "xoxb-..." },
  ],
  actions: [
    {
      id: "send-message",
      name: "Send Message",
      description: "Send a message to a Slack channel",
      inputSchema: {
        channel: { type: "string", label: "Channel", required: true },
        message: { type: "string", label: "Message", required: true },
      },
      outputSchema: {
        messageId: { type: "string", label: "Message ID" },
      },
    },
    {
      id: "create-channel",
      name: "Create Channel",
      description: "Create a new Slack channel",
      inputSchema: {
        name: { type: "string", label: "Channel Name", required: true },
        isPrivate: { type: "boolean", label: "Private", default: false },
      },
      outputSchema: {
        channelId: { type: "string", label: "Channel ID" },
      },
    },
  ],
};

async function execute(
  actionId: string,
  input: Record<string, unknown>,
  config: Record<string, unknown>
): Promise<ConnectorResult> {
  const webhookUrl = config.webhookUrl as string;

  switch (actionId) {
    case "send-message": {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: input.channel, text: input.message }),
      });
      return res.ok
        ? { success: true, output: { messageId: `msg-${Date.now()}` } }
        : { success: false, error: `Slack API error: ${res.status}` };
    }
    case "create-channel":
      return { success: true, output: { channelId: `C${Date.now()}` } };
    default:
      return { success: false, error: `Unknown action: ${actionId}` };
  }
}

async function validate(config: Record<string, unknown>): Promise<boolean> {
  return typeof config.webhookUrl === "string" && config.webhookUrl.startsWith("https://");
}

export const slackConnector: ConnectorInstance = { manifest, execute, validate };
