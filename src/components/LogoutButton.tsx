"use client";

import { useTranslations } from "next-intl";

export default function LogoutButton() {
  const t = useTranslations("common");

  return (
    <a
      href="/api/auth/logout"
      className="block w-full text-left text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
    >
      {t("logout")}
    </a>
  );
}
