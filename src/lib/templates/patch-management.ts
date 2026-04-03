import type { WorkflowTemplate } from "./index";

export const patchManagementTemplate: WorkflowTemplate = {
  id: "patch-management",
  name: "Patch Management",
  nameKey: "patch_name",
  description: "Scheduled patch deployment: scan for updates, test in staging, deploy to production, and verify compliance.",
  descriptionKey: "patch_desc",
  category: "maintenance",
  tags: ["patching", "updates", "maintenance", "security"],
  version: "1.0.0",
  definition: {
    nodes: [
      { id: "s1", type: "step", position: { x: 250, y: 0 }, data: { label: "Scan for Updates", type: "RUN_COMMAND", config: { command: "scan-patches --severity critical,high" } } },
      { id: "s2", type: "step", position: { x: 250, y: 120 }, data: { label: "Test in Staging", type: "RUN_COMMAND", config: { command: "deploy-patches --env staging" } } },
      { id: "s3", type: "step", position: { x: 250, y: 240 }, data: { label: "Approval Gate", type: "APPROVAL", config: { approver: "ops-lead" } } },
      { id: "s4", type: "step", position: { x: 250, y: 360 }, data: { label: "Deploy to Production", type: "RUN_COMMAND", config: { command: "deploy-patches --env production" } } },
      { id: "s5", type: "step", position: { x: 250, y: 480 }, data: { label: "Verify & Report", type: "SCRIPT", config: { script: "verify-patches.sh" } } },
      { id: "s6", type: "step", position: { x: 250, y: 600 }, data: { label: "Notify Team", type: "CONNECTOR_ACTION", config: { connectorId: "slack", actionId: "send-message", channel: "#ops-updates" } } },
    ],
    edges: [
      { id: "e1-2", source: "s1", target: "s2", animated: true },
      { id: "e2-3", source: "s2", target: "s3", animated: true },
      { id: "e3-4", source: "s3", target: "s4", animated: true },
      { id: "e4-5", source: "s4", target: "s5", animated: true },
      { id: "e5-6", source: "s5", target: "s6", animated: true },
    ],
  },
  documentation: `## Patch Management Workflow

### Prerequisites
- Server access configured
- Slack connector for notifications

### Steps
1. **Scan for Updates** — identifies critical and high-severity patches
2. **Test in Staging** — deploys patches to staging environment
3. **Approval Gate** — ops lead reviews staging results before production
4. **Deploy to Production** — applies approved patches
5. **Verify & Report** — confirms patches applied, generates compliance report
6. **Notify Team** — sends summary to ops channel

### Schedule
Recommended: weekly on Tuesday nights (maintenance window)`,
};
