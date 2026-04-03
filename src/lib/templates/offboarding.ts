import type { WorkflowTemplate } from "./index";

export const offboardingTemplate: WorkflowTemplate = {
  id: "employee-offboarding",
  name: "Employee Offboarding",
  nameKey: "offboarding_name",
  description: "Securely decommission departing employee: revoke access, disable accounts, transfer data, and notify stakeholders.",
  descriptionKey: "offboarding_desc",
  category: "hr",
  tags: ["offboarding", "hr", "security", "deprovisioning"],
  version: "1.0.0",
  definition: {
    nodes: [
      { id: "s1", type: "step", position: { x: 250, y: 0 }, data: { label: "Disable AD Account", type: "DISABLE_USER", config: {} } },
      { id: "s2", type: "step", position: { x: 250, y: 120 }, data: { label: "Revoke VPN Access", type: "RUN_COMMAND", config: { command: "revoke-vpn --user {{username}}" } } },
      { id: "s3", type: "step", position: { x: 250, y: 240 }, data: { label: "Transfer Email Data", type: "SCRIPT", config: { script: "transfer-mailbox.sh" } } },
      { id: "s4", type: "step", position: { x: 250, y: 360 }, data: { label: "Notify IT & HR", type: "CONNECTOR_ACTION", config: { connectorId: "slack", actionId: "send-message", channel: "#it-ops" } } },
      { id: "s5", type: "step", position: { x: 250, y: 480 }, data: { label: "Close Jira Tickets", type: "CONNECTOR_ACTION", config: { connectorId: "jira", actionId: "update-status", status: "Closed" } } },
    ],
    edges: [
      { id: "e1-2", source: "s1", target: "s2", animated: true },
      { id: "e2-3", source: "s2", target: "s3", animated: true },
      { id: "e3-4", source: "s3", target: "s4", animated: true },
      { id: "e4-5", source: "s4", target: "s5", animated: true },
    ],
  },
  documentation: `## Employee Offboarding Workflow

### Prerequisites
- LDAP/AD connector configured
- Slack connector configured

### Steps
1. **Disable AD Account** — immediately locks the user out of all systems
2. **Revoke VPN Access** — terminates remote access
3. **Transfer Email Data** — migrates mailbox to manager or archive
4. **Notify IT & HR** — alerts teams via Slack
5. **Close Jira Tickets** — reassigns or closes open tickets

### Customization
- Add a delay step before data deletion for retention compliance
- Include hardware return tracking`,
};
