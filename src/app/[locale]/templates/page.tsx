"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { TemplateCategory } from "@/lib/templates";

interface TemplateInfo {
  id: string;
  name: string;
  nameKey: string;
  description: string;
  descriptionKey: string;
  category: TemplateCategory;
  tags: string[];
  version: string;
  definition: { nodes: unknown[]; edges: unknown[] };
}

const categoryColors: Record<TemplateCategory, string> = {
  hr: "bg-purple-100 text-purple-700",
  security: "bg-red-100 text-red-700",
  maintenance: "bg-blue-100 text-blue-700",
  compliance: "bg-amber-100 text-amber-700",
};

export default function TemplatesPage() {
  const t = useTranslations("templates");
  const tc = useTranslations("common");
  const [templates, setTemplates] = useState<TemplateInfo[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState<string | null>(null);

  const categoryKeys: TemplateCategory[] = ["hr", "security", "maintenance", "compliance"];

  useEffect(() => {
    fetch("/api/templates")
      .then((res) => res.json())
      .then((data) => setTemplates(data.templates || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeCategories = ["all", ...new Set(templates.map((t) => t.category))];
  const filtered = filter === "all" ? templates : templates.filter((t) => t.category === filter);

  function templateName(tmpl: TemplateInfo): string {
    return t(tmpl.nameKey);
  }

  function templateDesc(tmpl: TemplateInfo): string {
    return t(tmpl.descriptionKey);
  }

  async function handleImport(tmpl: TemplateInfo) {
    setImporting(tmpl.id);
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: tmpl.id, name: templateName(tmpl), description: templateDesc(tmpl) }),
      });
      const data = await res.json();
      if (data.workflow) {
        alert(t("importSuccess", { name: data.workflow.name }));
      }
    } catch {
      alert(t("importError"));
    } finally {
      setImporting(null);
    }
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
            {cat === "all" ? t("all") : categoryKeys.includes(cat as TemplateCategory) ? t(cat) : cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((tmpl) => (
          <div
            key={tmpl.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow flex flex-col"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-gray-900">{templateName(tmpl)}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[tmpl.category]}`}>
                {categoryKeys.includes(tmpl.category) ? t(tmpl.category) : tmpl.category}
              </span>
            </div>

            <p className="text-sm text-gray-500 mb-4 flex-1">{templateDesc(tmpl)}</p>

            <div className="mb-4">
              <div className="flex flex-wrap gap-1.5">
                {tmpl.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-gray-50 border border-gray-200 rounded text-xs text-gray-500">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-400">
                {t("steps", { count: tmpl.definition.nodes.length })}
              </span>
              <button
                onClick={() => handleImport(tmpl)}
                disabled={importing === tmpl.id}

                className="px-4 py-1.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {importing === tmpl.id ? tc("loading") : t("useTemplate")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
