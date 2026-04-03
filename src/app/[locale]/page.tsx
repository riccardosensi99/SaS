import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function Home() {
  const t = await getTranslations("landing");

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">{t("title")}</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-md text-center">
        {t("description")}
      </p>
      <div className="flex gap-4">
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          {t("goToDashboard")}
        </Link>
        <Link
          href="/workflows"
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
        >
          {t("viewWorkflows")}
        </Link>
      </div>
    </div>
  );
}
