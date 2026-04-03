"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { ConnectorCategory } from "@/lib/connectors/types";

interface ConnectorInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: ConnectorCategory;
  version: string;
  actions: Array<{ id: string; name: string; description: string }>;
  enabled?: boolean;
  configId?: string;
}

const iconMap: Record<string, string> = {
  slack: "#4A154B",
  jira: "#0052CC",
  ldap: "#0078D4",
};

export default function ConnectorsPage() {
  const t = useTranslations("connectors");
  const tc = useTranslations("common");
  const [connectors, setConnectors] = useState<ConnectorInfo[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const categoryKeys: ConnectorCategory[] = ["communication", "ticketing", "identity", "cloud", "monitoring"];

  useEffect(() => {
    fetch("/api/connectors")
      .then((res) => res.json())
      .then((data) => setConnectors(data.connectors || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeCategories = ["all", ...new Set(connectors.map((c) => c.category))];
  const filtered = filter === "all" ? connectors : connectors.filter((c) => c.category === filter);

  function connectorName(c: ConnectorInfo): string {
    try { return t(`${c.id}_name`); } catch { return c.name; }
  }

  function connectorDesc(c: ConnectorInfo): string {
    try { return t(`${c.id}_desc`); } catch { return c.description; }
  }

  function actionName(actionId: string, fallback: string): string {
    try { return t(actionId); } catch { return fallback; }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-400">{tc("loading")}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <p className="text-gray-500 mt-1">{t("subtitle")}</p>
      </div>

      <div className="flex gap-2 mb-6">
        {activeCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === cat
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat === "all" ? t("all") : categoryKeys.includes(cat as ConnectorCategory) ? t(cat as ConnectorCategory) : cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((connector) => (
          <div
            key={connector.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: iconMap[connector.icon] || "#6b7280" }}
                >
                  {connector.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{connectorName(connector)}</h3>
                  <span className="text-xs text-gray-400">v{connector.version}</span>
                </div>
              </div>
              {connector.enabled && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  {tc("active")}
                </span>
              )}
            </div>

            <p className="text-sm text-gray-500 mb-4">{connectorDesc(connector)}</p>

            <div className="mb-4">
              <p className="text-xs font-medium text-gray-400 mb-1.5">{t("actions")}</p>
              <div className="flex flex-wrap gap-1.5">
                {connector.actions.map((action) => (
                  <span
                    key={action.id}
                    className="px-2 py-0.5 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600"
                  >
                    {actionName(action.id, action.name)}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-400">
                {categoryKeys.includes(connector.category) ? t(connector.category) : connector.category}
              </span>
              <button
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  connector.enabled
                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                    : "bg-primary-50 text-primary-600 hover:bg-primary-100"
                }`}
              >
                {connector.enabled ? tc("disable") : tc("enable")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
