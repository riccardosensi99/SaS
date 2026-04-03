import type { ConnectorInstance, ConnectorManifest } from "./types";
import { slackConnector } from "./slack";
import { jiraConnector } from "./jira";
import { ldapConnector } from "./ldap";

const connectors = new Map<string, ConnectorInstance>();

function register(connector: ConnectorInstance) {
  connectors.set(connector.manifest.id, connector);
}

register(slackConnector);
register(jiraConnector);
register(ldapConnector);

export function getConnector(id: string): ConnectorInstance | undefined {
  return connectors.get(id);
}

export function listConnectors(): ConnectorManifest[] {
  return Array.from(connectors.values()).map((c) => c.manifest);
}

export function listConnectorsByCategory(category: string): ConnectorManifest[] {
  return listConnectors().filter((m) => m.category === category);
}

export function getConnectorActions(connectorId: string) {
  const connector = connectors.get(connectorId);
  return connector?.manifest.actions ?? [];
}
