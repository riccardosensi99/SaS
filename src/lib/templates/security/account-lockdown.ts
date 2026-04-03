import type { WorkflowTemplate } from "../index";

export const accountLockdownPlaybook: WorkflowTemplate = {
  id: "security-account-lockdown",
  name: "Compromised Account Lockdown",
  nameKey: "lockdown_name",
  description: "Immediate response to compromised accounts: disable access, revoke sessions, audit recent activity, and secure the account.",
  descriptionKey: "lockdown_desc",
  category: "security",
  tags: ["account-compromise", "access-control", "incident-response"],
  version: "1.0.0",
  definition: {
    nodes: [
      { id: "s1", type: "step", position: { x: 250, y: 0 }, data: { label: "Disable Account", type: "CONNECTOR_ACTION", config: { connectorId: "ldap", actionId: "disable-user" } } },
      { id: "s2", type: "step", position: { x: 250, y: 120 }, data: { label: "Revoke Active Sessions", type: "RUN_COMMAND", config: { command: "revoke-sessions --user {{username}}" } } },
      { id: "s3", type: "step", position: { x: 250, y: 240 }, data: { label: "Audit Recent Activity", type: "SCRIPT", config: { script: "audit-user-activity.sh" } } },
      { id: "s4", type: "step", position: { x: 250, y: 360 }, data: { label: "Security Team Review", type: "APPROVAL", config: { approver: "security-team" } } },
      { id: "s5", type: "step", position: { x: 250, y: 480 }, data: { label: "Re-enable with New Credentials", type: "RUN_COMMAND", config: { command: "reset-and-enable --user {{username}}" } } },
      { id: "s6", type: "step", position: { x: 250, y: 600 }, data: { label: "Notify User", type: "EMAIL_NOTIFICATION", config: { to: "{{user_email}}" } } },
    ],
    edges: [
      { id: "e1-2", source: "s1", target: "s2", animated: true },
      { id: "e2-3", source: "s2", target: "s3", animated: true },
      { id: "e3-4", source: "s3", target: "s4", animated: true },
      { id: "e4-5", source: "s4", target: "s5", animated: true },
      { id: "e5-6", source: "s5", target: "s6", animated: true },
    ],
  },
  documentation: "Automated account lockdown with session revocation, activity audit, and managed recovery.",
};
