import type { WorkflowTemplate } from "./index";

export const backupVerificationTemplate: WorkflowTemplate = {
  id: "backup-verification",
  name: "Backup Verification",
  nameKey: "backup_name",
  description: "Automated backup health checks: verify backup jobs completed, test restore capability, and alert on failures.",
  descriptionKey: "backup_desc",
  category: "maintenance",
  tags: ["backup", "disaster-recovery", "verification", "monitoring"],
  version: "1.0.0",
  definition: {
    nodes: [
      { id: "s1", type: "step", position: { x: 250, y: 0 }, data: { label: "Check Backup Status", type: "RUN_COMMAND", config: { command: "check-backups --last 24h" } } },
      { id: "s2", type: "step", position: { x: 250, y: 120 }, data: { label: "Verify Integrity", type: "SCRIPT", config: { script: "verify-backup-integrity.sh" } } },
      { id: "s3", type: "step", position: { x: 250, y: 240 }, data: { label: "Test Restore", type: "RUN_COMMAND", config: { command: "test-restore --target sandbox" } } },
      { id: "s4", type: "step", position: { x: 100, y: 360 }, data: { label: "Alert on Failure", type: "CONNECTOR_ACTION", config: { connectorId: "slack", actionId: "send-message", channel: "#alerts" } } },
      { id: "s5", type: "step", position: { x: 400, y: 360 }, data: { label: "Log Success", type: "SCRIPT", config: { script: "log-backup-result.sh" } } },
    ],
    edges: [
      { id: "e1-2", source: "s1", target: "s2", animated: true },
      { id: "e2-3", source: "s2", target: "s3", animated: true },
      { id: "e3-4", source: "s3", target: "s4" },
      { id: "e3-5", source: "s3", target: "s5" },
    ],
  },
  documentation: `## Backup Verification Workflow

### Prerequisites
- Backup system access
- Slack connector for alerts

### Steps
1. **Check Backup Status** — confirms last 24h backup jobs completed
2. **Verify Integrity** — checksums and metadata validation
3. **Test Restore** — restores to sandbox to prove recoverability
4. **Alert on Failure** — notifies #alerts if any step fails
5. **Log Success** — records verification in audit log

### Schedule
Recommended: daily at 6:00 AM`,
};
