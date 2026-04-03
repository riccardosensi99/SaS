import { onboardingTemplate } from "./onboarding";
import { offboardingTemplate } from "./offboarding";
import { patchManagementTemplate } from "./patch-management";
import { backupVerificationTemplate } from "./backup-verification";
import { accessReviewTemplate } from "./access-review";

export interface WorkflowTemplate {
  id: string;
  name: string;
  nameKey: string;
  description: string;
  descriptionKey: string;
  category: TemplateCategory;
  tags: string[];
  version: string;
  definition: {
    nodes: TemplateNode[];
    edges: TemplateEdge[];
  };
  documentation: string;
}

export type TemplateCategory = "hr" | "security" | "maintenance" | "compliance";

export interface TemplateNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: { label: string; type: string; config: Record<string, unknown> };
}

export interface TemplateEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
}

export const categoryLabels: Record<TemplateCategory, string> = {
  hr: "HR & People",
  security: "Security",
  maintenance: "Maintenance",
  compliance: "Compliance & Audit",
};

const templates: WorkflowTemplate[] = [
  onboardingTemplate,
  offboardingTemplate,
  patchManagementTemplate,
  backupVerificationTemplate,
  accessReviewTemplate,
];

export function listTemplates(): WorkflowTemplate[] {
  return templates;
}

export function getTemplate(id: string): WorkflowTemplate | undefined {
  return templates.find((t) => t.id === id);
}

export function listTemplatesByCategory(category: TemplateCategory): WorkflowTemplate[] {
  return templates.filter((t) => t.category === category);
}
