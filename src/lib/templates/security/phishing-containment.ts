import type { WorkflowTemplate } from "../index";

export const phishingContainmentPlaybook: WorkflowTemplate = {
  id: "security-phishing-containment",
  name: "Phishing Email Containment",
  nameKey: "phishing_name",
  description: "Contain phishing attacks: block sender, quarantine emails, reset affected credentials, and notify impacted users.",
  descriptionKey: "phishing_desc",
  category: "security",
  tags: ["phishing", "email-security", "incident-response"],
  version: "1.0.0",
  definition: {
    nodes: [
      { id: "s1", type: "step", position: { x: 250, y: 0 }, data: { label: "Block Sender Domain", type: "RUN_COMMAND", config: { command: "block-email-domain --domain {{sender_domain}}" } } },
      { id: "s2", type: "step", position: { x: 250, y: 120 }, data: { label: "Quarantine Matching Emails", type: "RUN_COMMAND", config: { command: "quarantine-emails --subject '{{email_subject}}'" } } },
      { id: "s3", type: "step", position: { x: 250, y: 240 }, data: { label: "Identify Affected Users", type: "CONNECTOR_ACTION", config: { connectorId: "ldap", actionId: "search-users" } } },
      { id: "s4", type: "step", position: { x: 250, y: 360 }, data: { label: "Reset Compromised Passwords", type: "RUN_COMMAND", config: { command: "force-password-reset --users {{affected_users}}" } } },
      { id: "s5", type: "step", position: { x: 250, y: 480 }, data: { label: "Notify Affected Users", type: "EMAIL_NOTIFICATION", config: { to: "{{affected_users}}", subject: "Security Alert: Phishing Attempt" } } },
      { id: "s6", type: "step", position: { x: 250, y: 600 }, data: { label: "Report to Security Team", type: "CONNECTOR_ACTION", config: { connectorId: "slack", actionId: "send-message", channel: "#security-incidents" } } },
    ],
    edges: [
      { id: "e1-2", source: "s1", target: "s2", animated: true },
      { id: "e2-3", source: "s2", target: "s3", animated: true },
      { id: "e3-4", source: "s3", target: "s4", animated: true },
      { id: "e4-5", source: "s4", target: "s5", animated: true },
      { id: "e5-6", source: "s5", target: "s6", animated: true },
    ],
  },
  documentation: "Automated phishing containment with email quarantine, credential reset, and user notification.",
};
