import { logoutAction } from "@/actions/auth";
import { auth } from "@/auth";
import { CategoryNav } from "@/components/category-nav";
import { LanguageProvider } from "@/components/language-provider";
import { LanguageSwitcher } from "@/components/language-switcher";
import { T } from "@/components/translated-text";
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "SaaS Marketplace",
  description: "Multi-store SaaS marketplace platform",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en">
      <body className="bg-white text-gray-950">
        <LanguageProvider>
          <header className="sticky top-0 z-50 border-b border-black/10 bg-white/90 shadow-sm backdrop-blur-xl">
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
              <Link href="/" className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-black text-lg font-bold text-white">
                  M
                </span>

                <span className="truncate text-xl font-extrabold tracking-tight md:text-2xl">
                  <T path="nav.brand" />
                </span>
              </Link>

              <div className="hidden items-center rounded-full border border-black/10 bg-gray-50 p-1 text-sm font-medium md:flex">
                <Link
                  href="/stores"
                  className="rounded-full px-4 py-2 transition hover:bg-white hover:shadow-sm"
                >
                  <T path="nav.stores" />
                </Link>

                {session?.user && (
                  <Link
                    href="/dashboard"
                    className="rounded-full px-4 py-2 transition hover:bg-white hover:shadow-sm"
                  >
                    <T path="nav.dashboard" />
                  </Link>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2 md:gap-3">
                <LanguageSwitcher />

                {session?.user ? (
                  <form action={logoutAction}>
                    <button className="rounded-full border border-black/10 bg-white px-3 py-2 text-sm font-semibold shadow-sm transition hover:bg-black hover:text-white md:px-4">
                      <T path="nav.logout" />
                    </button>
                  </form>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="rounded-full px-3 py-2 text-sm font-semibold transition hover:bg-gray-100 md:px-4"
                    >
                      <T path="nav.login" />
                    </Link>

                    <Link
                      href="/register"
                      className="hidden rounded-full bg-black px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 sm:inline-flex"
                    >
                      <T path="nav.register" />
                    </Link>
                  </>
                )}
              </div>
            </nav>

            <CategoryNav />
          </header>

          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
