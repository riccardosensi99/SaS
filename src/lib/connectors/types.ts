export interface ConnectorManifest {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: ConnectorCategory;
  version: string;
  actions: ConnectorActionDef[];
  configSchema: ConnectorConfigField[];
}

export type ConnectorCategory = "communication" | "ticketing" | "identity" | "cloud" | "monitoring";

export interface ConnectorActionDef {
  id: string;
  name: string;
  description: string;
  inputSchema: Record<string, ConnectorFieldSchema>;
  outputSchema: Record<string, ConnectorFieldSchema>;
}

export interface ConnectorFieldSchema {
  type: "string" | "number" | "boolean" | "object" | "array";
  label: string;
  required?: boolean;
  default?: unknown;
  options?: Array<{ label: string; value: string }>;
}

export interface ConnectorConfigField {
  key: string;
  label: string;
  type: "string" | "password" | "url" | "number";
  required: boolean;
  placeholder?: string;
}

export interface ConnectorInstance {
  manifest: ConnectorManifest;
  execute(actionId: string, input: Record<string, unknown>, config: Record<string, unknown>): Promise<ConnectorResult>;
  validate(config: Record<string, unknown>): Promise<boolean>;
}

export interface ConnectorResult {
  success: boolean;
  output?: Record<string, unknown>;
  error?: string;
}

export const categoryLabels: Record<ConnectorCategory, string> = {
  communication: "Communication",
  ticketing: "Ticketing & Project Management",
  identity: "Identity & Access",
  cloud: "Cloud Infrastructure",
  monitoring: "Monitoring & Alerting",
};
