"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/config";

const languageLabels: Record<Locale, string> = {
  en: "English",
  it: "Italiano",
};

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(newLocale: Locale) {
    // Remove current locale prefix if present, then add new one
    let path = pathname;
    for (const loc of locales) {
      if (path.startsWith(`/${loc}/`) || path === `/${loc}`) {
        path = path.slice(`/${loc}`.length) || "/";
        break;
      }
    }
    router.push(`/${newLocale}${path === "/" ? "" : path}`);
  }

  return (
    <div className="flex items-center gap-1.5">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => switchLocale(loc)}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            locale === loc
              ? "bg-primary-600 text-white"
              : "text-gray-400 hover:text-white hover:bg-gray-700"
          }`}
        >
          {languageLabels[loc]}
        </button>
      ))}
    </div>
  );
}
