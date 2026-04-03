import type { WorkflowTemplate } from "./index";

export const accessReviewTemplate: WorkflowTemplate = {
  id: "access-review",
  name: "Access Review",
  nameKey: "access_name",
  description: "Periodic access audit: pull user permissions, flag excessive access, route approvals to managers, and revoke unauthorized access.",
  descriptionKey: "access_desc",
  category: "compliance",
  tags: ["access-review", "compliance", "audit", "permissions"],
  version: "1.0.0",
  definition: {
    nodes: [
      { id: "s1", type: "step", position: { x: 250, y: 0 }, data: { label: "Pull User Permissions", type: "CONNECTOR_ACTION", config: { connectorId: "ldap", actionId: "search-users", filter: "(objectClass=person)" } } },
      { id: "s2", type: "step", position: { x: 250, y: 120 }, data: { label: "Flag Excessive Access", type: "SCRIPT", config: { script: "flag-excessive-permissions.sh" } } },
      { id: "s3", type: "step", position: { x: 250, y: 240 }, data: { label: "Manager Approval", type: "APPROVAL", config: { approver: "department-managers" } } },
      { id: "s4", type: "step", position: { x: 250, y: 360 }, data: { label: "Revoke Unauthorized", type: "CONNECTOR_ACTION", config: { connectorId: "ldap", actionId: "disable-user" } } },
      { id: "s5", type: "step", position: { x: 250, y: 480 }, data: { label: "Generate Audit Report", type: "SCRIPT", config: { script: "generate-access-report.sh" } } },
      { id: "s6", type: "step", position: { x: 250, y: 600 }, data: { label: "Notify Compliance", type: "EMAIL_NOTIFICATION", config: { to: "compliance@company.com" } } },
    ],
    edges: [
      { id: "e1-2", source: "s1", target: "s2", animated: true },
      { id: "e2-3", source: "s2", target: "s3", animated: true },
      { id: "e3-4", source: "s3", target: "s4", animated: true },
      { id: "e4-5", source: "s4", target: "s5", animated: true },
      { id: "e5-6", source: "s5", target: "s6", animated: true },
    ],
  },
  documentation: `## Access Review Workflow

### Prerequisites
- LDAP/AD connector configured
- Email notifications enabled

### Steps
1. **Pull User Permissions** — queries AD for all user group memberships
2. **Flag Excessive Access** — identifies users with permissions beyond their role
3. **Manager Approval** — routes flagged users to their managers for review
4. **Revoke Unauthorized** — disables access for rejected users
5. **Generate Audit Report** — creates compliance-ready PDF report
6. **Notify Compliance** — emails the report to the compliance team

### Schedule
Recommended: quarterly`,
};
