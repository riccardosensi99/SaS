"use client";

import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/config";

const languageLabels: Record<Locale, string> = {
  en: "English",
  it: "Italiano",
};

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();

  function getLocalizedHref(newLocale: Locale): string {
    // Strip current locale prefix if present
    let path = pathname;
    for (const loc of locales) {
      if (path.startsWith(`/${loc}/`)) {
        path = path.slice(loc.length + 1);
        break;
      }
      if (path === `/${loc}`) {
        path = "/";
        break;
      }
    }
    // Build new path with locale prefix
    return `/${newLocale}${path === "/" ? "" : path}`;
  }

  return (
    <div className="flex items-center gap-1.5">
      {locales.map((loc) => (
        <a
          key={loc}
          href={getLocalizedHref(loc)}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            locale === loc
              ? "bg-primary-600 text-white"
              : "text-gray-400 hover:text-white hover:bg-gray-700"
          }`}
        >
          {languageLabels[loc]}
        </a>
      ))}
    </div>
  );
}
