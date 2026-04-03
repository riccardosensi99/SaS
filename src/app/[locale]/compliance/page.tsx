"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface FrameworkSummary {
  id: string;
  name: string;
  nameKey: string;
  description: string;
  descriptionKey: string;
  score: number;
  controls: { total: number; enforced: number; partial: number; gap: number };
}

const scoreColor = (score: number) =>
  score >= 80 ? "text-green-600" : score >= 50 ? "text-yellow-600" : "text-red-600";

const scoreBarColor = (score: number) =>
  score >= 80 ? "bg-green-500" : score >= 50 ? "bg-yellow-500" : "bg-red-500";

export default function CompliancePage() {
  const t = useTranslations("compliance");
  const tc = useTranslations("common");
  const [frameworks, setFrameworks] = useState<FrameworkSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/compliance")
      .then((res) => res.json())
      .then((data) => setFrameworks(data.frameworks || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {frameworks.map((fw) => (
          <Link
            key={fw.id}
            href={`/compliance/${fw.id}`}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow block"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{t(fw.nameKey)}</h3>
                <p className="text-sm text-gray-500 mt-1">{t(fw.descriptionKey)}</p>
              </div>
              <span className={`text-3xl font-bold ${scoreColor(fw.score)}`}>
                {fw.score}%
              </span>
            </div>

            {/* Score bar */}
            <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
              <div
                className={`h-2 rounded-full transition-all ${scoreBarColor(fw.score)}`}
                style={{ width: `${fw.score}%` }}
              />
            </div>

            {/* Control stats */}
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="text-gray-600">{fw.controls.enforced} {t("enforced")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <span className="text-gray-600">{fw.controls.partial} {t("partial")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-gray-600">{fw.controls.gap} {t("gap")}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
