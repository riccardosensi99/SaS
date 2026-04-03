import Link from "next/link";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/config";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import LogoutButton from "@/components/LogoutButton";

async function UserProfile() {
  const session = await getSession();
  if (!session) return null;

  let user: { name: string; email: string; role: string } | null = null;
  let orgName = "";
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { organization: true },
    });
    if (dbUser) {
      user = { name: dbUser.name, email: dbUser.email, role: dbUser.role };
      orgName = dbUser.organization.name;
    }
  } catch {
    // DB not available
  }

  if (!user) return null;

  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium text-white truncate">{user.name}</p>
        <p className="text-xs text-gray-400 truncate">{user.email}</p>
        <p className="text-xs text-gray-500 truncate">{orgName}</p>
      </div>
      <LogoutButton />
    </div>
  );
}

async function Sidebar() {
  const t = await getTranslations("common");

  const navItems = [
    { href: "/dashboard", label: t("dashboard"), icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { href: "/workflows", label: t("workflows"), icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" },
    { href: "/templates", label: t("templates"), icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { href: "/security", label: t("security"), icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
    { href: "/compliance", label: t("compliance"), icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
    { href: "/connectors", label: t("connectors"), icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold text-primary-400">{t("appName")}</h1>
        <p className="text-xs text-gray-400 mt-1">{t("appTagline")}</p>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-800 space-y-3">
        <UserProfile />
        <LanguageSwitcher />
      </div>
    </aside>
  );
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();
  const session = await getSession();

  // No session = auth pages (login/register), show clean layout
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NextIntlClientProvider messages={messages}>
          <main>{children}</main>
        </NextIntlClientProvider>
      </div>
    );
  }

  // Authenticated = full layout with sidebar
  return (
    <div className="flex min-h-screen bg-gray-50">
      <NextIntlClientProvider messages={messages}>
        <Sidebar />
        <main className="flex-1 p-8">{children}</main>
      </NextIntlClientProvider>
    </div>
  );
}
