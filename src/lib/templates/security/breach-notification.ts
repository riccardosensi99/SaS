import type { WorkflowTemplate } from "../index";

export const breachNotificationPlaybook: WorkflowTemplate = {
  id: "security-breach-notification",
  name: "Data Breach Notification",
  nameKey: "breach_name",
  description: "Regulatory breach notification workflow: assess impact, notify authorities within required timeframes, inform affected users, and document response.",
  descriptionKey: "breach_desc",
  category: "security",
  tags: ["data-breach", "notification", "compliance", "gdpr"],
  version: "1.0.0",
  definition: {
    nodes: [
      { id: "s1", type: "step", position: { x: 250, y: 0 }, data: { label: "Assess Breach Impact", type: "SCRIPT", config: { script: "assess-breach-impact.sh" } } },
      { id: "s2", type: "step", position: { x: 250, y: 120 }, data: { label: "DPO/Legal Approval", type: "APPROVAL", config: { approver: "dpo@company.com" } } },
      { id: "s3", type: "step", position: { x: 250, y: 240 }, data: { label: "Notify Authority (72h)", type: "EMAIL_NOTIFICATION", config: { to: "{{authority_email}}", subject: "Data Breach Notification" } } },
      { id: "s4", type: "step", position: { x: 250, y: 360 }, data: { label: "Notify Affected Users", type: "EMAIL_NOTIFICATION", config: { to: "{{affected_users}}", subject: "Important: Data Breach Notice" } } },
      { id: "s5", type: "step", position: { x: 250, y: 480 }, data: { label: "Create Incident Report", type: "CONNECTOR_ACTION", config: { connectorId: "jira", actionId: "create-issue", project: "SEC" } } },
      { id: "s6", type: "step", position: { x: 250, y: 600 }, data: { label: "Document Response", type: "SCRIPT", config: { script: "generate-breach-report.sh" } } },
    ],
    edges: [
      { id: "e1-2", source: "s1", target: "s2", animated: true },
      { id: "e2-3", source: "s2", target: "s3", animated: true },
      { id: "e3-4", source: "s3", target: "s4", animated: true },
      { id: "e4-5", source: "s4", target: "s5", animated: true },
      { id: "e5-6", source: "s5", target: "s6", animated: true },
    ],
  },
  documentation: "GDPR-compliant breach notification workflow with 72-hour authority notification and affected user communication.",
};
