export interface ComplianceFramework {
  id: string;
  name: string;
  nameKey: string;
  description: string;
  descriptionKey: string;
  controls: ComplianceControl[];
}

export interface ComplianceControl {
  id: string;
  name: string;
  nameKey: string;
  description: string;
  category: string;
  auditActions: string[];
  status?: "enforced" | "partial" | "gap";
  evidence?: number;
}

export const frameworks: ComplianceFramework[] = [
  {
    id: "soc2",
    name: "SOC 2",
    nameKey: "soc2",
    description: "Service Organization Control 2 — Trust Service Criteria",
    descriptionKey: "soc2_desc",
    controls: [
      { id: "CC6.1", name: "Logical Access", nameKey: "cc6_1", description: "Logical access security over protected information assets", category: "Security", auditActions: ["user.create", "user.disable", "access.revoke"] },
      { id: "CC6.2", name: "Access Provisioning", nameKey: "cc6_2", description: "New user access provisioning and deprovisioning", category: "Security", auditActions: ["user.create", "user.disable", "workflow.execute"] },
      { id: "CC6.3", name: "Access Removal", nameKey: "cc6_3", description: "Timely removal of access for terminated personnel", category: "Security", auditActions: ["user.disable", "access.revoke"] },
      { id: "CC7.1", name: "Monitoring", nameKey: "cc7_1", description: "Detection and monitoring of security events", category: "Monitoring", auditActions: ["workflow.execute", "incident.create"] },
      { id: "CC7.2", name: "Incident Response", nameKey: "cc7_2", description: "Incident identification and response procedures", category: "Monitoring", auditActions: ["incident.create", "incident.resolve"] },
      { id: "CC8.1", name: "Change Management", nameKey: "cc8_1", description: "Authorization and testing of infrastructure changes", category: "Operations", auditActions: ["workflow.create", "workflow.execute", "approval.granted"] },
    ],
  },
  {
    id: "gdpr",
    name: "GDPR",
    nameKey: "gdpr",
    description: "General Data Protection Regulation",
    descriptionKey: "gdpr_desc",
    controls: [
      { id: "Art.5", name: "Data Processing Principles", nameKey: "art5", description: "Lawfulness, fairness, transparency of data processing", category: "Data Protection", auditActions: ["data.access", "data.export"] },
      { id: "Art.15", name: "Right of Access", nameKey: "art15", description: "Data subject access requests", category: "Data Subject Rights", auditActions: ["data.access", "data.export"] },
      { id: "Art.17", name: "Right to Erasure", nameKey: "art17", description: "Right to be forgotten", category: "Data Subject Rights", auditActions: ["data.delete", "user.disable"] },
      { id: "Art.25", name: "Data Protection by Design", nameKey: "art25", description: "Privacy by design and by default", category: "Technical Measures", auditActions: ["config.change", "workflow.create"] },
      { id: "Art.33", name: "Breach Notification", nameKey: "art33", description: "Notification of personal data breach to authority", category: "Incident Response", auditActions: ["incident.create", "notification.send"] },
    ],
  },
  {
    id: "hipaa",
    name: "HIPAA",
    nameKey: "hipaa",
    description: "Health Insurance Portability and Accountability Act",
    descriptionKey: "hipaa_desc",
    controls: [
      { id: "164.312(a)", name: "Access Control", nameKey: "hipaa_access", description: "Unique user identification and emergency access", category: "Technical Safeguards", auditActions: ["user.create", "user.disable", "access.grant"] },
      { id: "164.312(b)", name: "Audit Controls", nameKey: "hipaa_audit", description: "Hardware, software, and procedural audit mechanisms", category: "Technical Safeguards", auditActions: ["workflow.execute", "data.access"] },
      { id: "164.312(c)", name: "Integrity Controls", nameKey: "hipaa_integrity", description: "Mechanisms to authenticate electronic PHI", category: "Technical Safeguards", auditActions: ["data.modify", "config.change"] },
      { id: "164.312(d)", name: "Authentication", nameKey: "hipaa_auth", description: "Verify identity of persons seeking access", category: "Technical Safeguards", auditActions: ["user.login", "user.create"] },
    ],
  },
  {
    id: "pci-dss",
    name: "PCI-DSS",
    nameKey: "pcidss",
    description: "Payment Card Industry Data Security Standard",
    descriptionKey: "pcidss_desc",
    controls: [
      { id: "Req.7", name: "Restrict Access", nameKey: "pci_7", description: "Restrict access to cardholder data by business need to know", category: "Access Control", auditActions: ["access.grant", "access.revoke", "user.create"] },
      { id: "Req.8", name: "Identify Users", nameKey: "pci_8", description: "Identify and authenticate access to system components", category: "Access Control", auditActions: ["user.login", "user.create", "user.disable"] },
      { id: "Req.10", name: "Track Access", nameKey: "pci_10", description: "Track and monitor all access to network resources", category: "Monitoring", auditActions: ["data.access", "workflow.execute", "user.login"] },
      { id: "Req.11", name: "Test Security", nameKey: "pci_11", description: "Regularly test security systems and processes", category: "Testing", auditActions: ["workflow.execute", "incident.create"] },
    ],
  },
];

export function getFramework(id: string): ComplianceFramework | undefined {
  return frameworks.find((f) => f.id === id);
}

export function evaluateControlStatus(
  control: ComplianceControl,
  auditLogCount: number
): ComplianceControl["status"] {
  if (auditLogCount === 0) return "gap";
  if (auditLogCount < 3) return "partial";
  return "enforced";
}
