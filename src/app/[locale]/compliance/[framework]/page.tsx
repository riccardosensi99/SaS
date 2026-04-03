"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface ControlDetail {
  id: string;
  name: string;
  nameKey: string;
  description: string;
  category: string;
  status: "enforced" | "partial" | "gap";
  evidence: number;
}

interface ReportData {
  framework: { id: string; name: string; nameKey: string };
  generatedAt: string;
  controls: ControlDetail[];
  summary: { total: number; enforced: number; partial: number; gap: number; score: number };
}

const statusStyles: Record<string, string> = {
  enforced: "bg-green-100 text-green-700",
  partial: "bg-yellow-100 text-yellow-700",
  gap: "bg-red-100 text-red-700",
};

export default function FrameworkDetailPage() {
  const params = useParams();
  const frameworkId = params.framework as string;
  const t = useTranslations("compliance");
  const tc = useTranslations("common");
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/compliance?framework=${frameworkId}`)
      .then((res) => res.json())
      .then((data) => setReport(data.report || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [frameworkId]);

  async function handleExportCSV() {
    const res = await fetch("/api/compliance/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ frameworkId, format: "csv" }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${frameworkId}-compliance-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-400">{tc("loading")}</p>
      </div>
    );
  }

  if (!report) {
    return <p className="text-gray-500">{t("notFound")}</p>;
  }

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/compliance" className="hover:text-primary-600">{t("title")}</Link>
        <span>/</span>
        <span className="text-gray-900">{t(report.framework.nameKey)}</span>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t(report.framework.nameKey)}</h1>
          <p className="text-gray-500 mt-1">
            {t("score")}: <span className="font-semibold">{report.summary.score}%</span> — {report.summary.enforced}/{report.summary.total} {t("controlsEnforced")}
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          {t("exportCSV")}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{report.summary.enforced}</p>
          <p className="text-sm text-green-600">{t("enforced")}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-700">{report.summary.partial}</p>
          <p className="text-sm text-yellow-600">{t("partial")}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-700">{report.summary.gap}</p>
          <p className="text-sm text-red-600">{t("gap")}</p>
        </div>
      </div>

      {/* Controls table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("controlId")}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("controlName")}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("category")}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("status")}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("evidence")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {report.controls.map((control) => (
              <tr key={control.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-mono text-gray-700">{control.id}</td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-900">{control.name}</p>
                  <p className="text-xs text-gray-500">{control.description}</p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{control.category}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[control.status]}`}>
                    {t(control.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{control.evidence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
