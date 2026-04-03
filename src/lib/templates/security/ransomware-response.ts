import type { WorkflowTemplate } from "../index";

export const ransomwareResponsePlaybook: WorkflowTemplate = {
  id: "security-ransomware-response",
  name: "Ransomware Detection Response",
  nameKey: "ransomware_name",
  description: "Automated response to ransomware detection: isolate affected systems, preserve evidence, notify stakeholders, and begin recovery.",
  descriptionKey: "ransomware_desc",
  category: "security",
  tags: ["ransomware", "incident-response", "security", "critical"],
  version: "1.0.0",
  definition: {
    nodes: [
      { id: "s1", type: "step", position: { x: 250, y: 0 }, data: { label: "Isolate Affected Host", type: "RUN_COMMAND", config: { command: "isolate-host --target {{host_ip}} --method network-disconnect" } } },
      { id: "s2", type: "step", position: { x: 250, y: 120 }, data: { label: "Disable Compromised Accounts", type: "CONNECTOR_ACTION", config: { connectorId: "ldap", actionId: "disable-user" } } },
      { id: "s3", type: "step", position: { x: 250, y: 240 }, data: { label: "Collect Forensic Evidence", type: "RUN_COMMAND", config: { command: "collect-evidence --host {{host_ip}} --output /forensics/" } } },
      { id: "s4", type: "step", position: { x: 250, y: 360 }, data: { label: "Alert Security Team", type: "CONNECTOR_ACTION", config: { connectorId: "slack", actionId: "send-message", channel: "#security-incidents" } } },
      { id: "s5", type: "step", position: { x: 250, y: 480 }, data: { label: "Create Incident Ticket", type: "CONNECTOR_ACTION", config: { connectorId: "jira", actionId: "create-issue", project: "SEC" } } },
      { id: "s6", type: "step", position: { x: 250, y: 600 }, data: { label: "CISO Approval for Recovery", type: "APPROVAL", config: { approver: "ciso@company.com" } } },
      { id: "s7", type: "step", position: { x: 250, y: 720 }, data: { label: "Begin System Recovery", type: "RUN_COMMAND", config: { command: "restore-from-backup --host {{host_ip}}" } } },
    ],
    edges: [
      { id: "e1-2", source: "s1", target: "s2", animated: true },
      { id: "e2-3", source: "s2", target: "s3", animated: true },
      { id: "e3-4", source: "s3", target: "s4", animated: true },
      { id: "e4-5", source: "s4", target: "s5", animated: true },
      { id: "e5-6", source: "s5", target: "s6", animated: true },
      { id: "e6-7", source: "s6", target: "s7", animated: true },
    ],
  },
  documentation: "Automated ransomware incident response with host isolation, evidence collection, and managed recovery.",
};
