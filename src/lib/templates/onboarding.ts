import type { WorkflowTemplate } from "./index";

export const onboardingTemplate: WorkflowTemplate = {
  id: "employee-onboarding",
  name: "Employee Onboarding",
  nameKey: "onboarding_name",
  description: "Automate the full employee onboarding process: create accounts, provision access, notify teams, and set up workstation.",
  descriptionKey: "onboarding_desc",
  category: "hr",
  tags: ["onboarding", "hr", "accounts", "provisioning"],
  version: "1.0.0",
  definition: {
    nodes: [
      { id: "s1", type: "step", position: { x: 250, y: 0 }, data: { label: "Create AD Account", type: "CREATE_USER", config: { department: "{{department}}", role: "{{role}}" } } },
      { id: "s2", type: "step", position: { x: 250, y: 120 }, data: { label: "Create Email", type: "CONNECTOR_ACTION", config: { connectorId: "ldap", actionId: "create-user" } } },
      { id: "s3", type: "step", position: { x: 250, y: 240 }, data: { label: "Provision Software", type: "INSTALL_SOFTWARE", config: { packages: ["office365", "slack", "vpn-client"] } } },
      { id: "s4", type: "step", position: { x: 250, y: 360 }, data: { label: "Notify Team on Slack", type: "CONNECTOR_ACTION", config: { connectorId: "slack", actionId: "send-message", channel: "#new-hires" } } },
      { id: "s5", type: "step", position: { x: 250, y: 480 }, data: { label: "Create Jira Onboarding Ticket", type: "CONNECTOR_ACTION", config: { connectorId: "jira", actionId: "create-issue", project: "HR" } } },
      { id: "s6", type: "step", position: { x: 250, y: 600 }, data: { label: "Manager Approval", type: "APPROVAL", config: { approver: "{{manager_email}}" } } },
    ],
    edges: [
      { id: "e1-2", source: "s1", target: "s2", animated: true },
      { id: "e2-3", source: "s2", target: "s3", animated: true },
      { id: "e3-4", source: "s3", target: "s4", animated: true },
      { id: "e4-5", source: "s4", target: "s5", animated: true },
      { id: "e5-6", source: "s5", target: "s6", animated: true },
    ],
  },
  documentation: `## Employee Onboarding Workflow

### Prerequisites
- LDAP/AD connector configured
- Slack connector configured
- Jira connector configured

### Steps
1. **Create AD Account** — creates the user in Active Directory with department and role
2. **Create Email** — provisions the corporate email account
3. **Provision Software** — installs standard software package (Office 365, Slack, VPN)
4. **Notify Team** — sends a welcome message to the #new-hires Slack channel
5. **Create Onboarding Ticket** — creates a Jira ticket to track remaining manual tasks
6. **Manager Approval** — final sign-off from the hiring manager

### Customization
- Edit the software list in step 3
- Change the Slack channel in step 4
- Add conditional steps based on department`,
};
