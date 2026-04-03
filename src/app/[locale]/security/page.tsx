"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface Incident {
  id: string;
  type: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status: "OPEN" | "INVESTIGATING" | "CONTAINED" | "RESOLVED";
  description: string;
  playbookId: string | null;
  createdAt: string;
  resolvedAt: string | null;
  timeline: Array<{ action: string; timestamp: string }>;
}

interface Playbook {
  id: string;
  name: string;
  nameKey: string;
  description: string;
  descriptionKey: string;
  tags: string[];
}

const severityColors: Record<string, string> = {
  CRITICAL: "bg-red-600 text-white",
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW: "bg-blue-100 text-blue-700",
};

const statusColors: Record<string, string> = {
  OPEN: "bg-red-100 text-red-700",
  INVESTIGATING: "bg-yellow-100 text-yellow-700",
  CONTAINED: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-green-100 text-green-700",
};

export default function SecurityPage() {
  const t = useTranslations("security");
  const tc = useTranslations("common");
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"incidents" | "playbooks">("playbooks");

  useEffect(() => {
    Promise.all([
      fetch("/api/security/incidents").then((r) => r.json()),
      fetch("/api/templates?category=security").then((r) => r.json()),
    ])
      .then(([incData, tmplData]) => {
        setIncidents(incData.incidents || []);
        setPlaybooks(tmplData.templates || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function playbookName(pb: Playbook): string {
    try { return t(pb.nameKey); } catch { return pb.name; }
  }
  function playbookDesc(pb: Playbook): string {
    try { return t(pb.descriptionKey); } catch { return pb.description; }
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

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab("playbooks")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "playbooks" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
          }`}
        >
          {t("playbooks")} ({playbooks.length})
        </button>
        <button
          onClick={() => setTab("incidents")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "incidents" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
          }`}
        >
          {t("incidents")} ({incidents.length})
        </button>
      </div>

      {/* Playbooks tab */}
      {tab === "playbooks" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {playbooks.map((pb) => (
            <div key={pb.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{playbookName(pb)}</h3>
                <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                  {t("security")}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-4">{playbookDesc(pb)}</p>
              <div className="flex flex-wrap gap-1.5">
                {pb.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-gray-50 border border-gray-200 rounded text-xs text-gray-500">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {playbooks.length === 0 && (
            <p className="text-gray-400 col-span-2 text-center py-8">{t("noPlaybooks")}</p>
          )}
        </div>
      )}

      {/* Incidents tab */}
      {tab === "incidents" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {incidents.length === 0 ? (
            <div className="p-8 text-center text-gray-400">{t("noIncidents")}</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("type")}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("severityLabel")}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("status")}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("created")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{inc.type}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${severityColors[inc.severity]}`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[inc.status]}`}>
                        {inc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(inc.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
