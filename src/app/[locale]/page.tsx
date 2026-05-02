import Link from "next/link";
import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("HomePage");

  return (
    <main className="mx-auto max-w-6xl px-6 py-20">
      <section className="grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            SaaS Marketplace Platform
          </p>

          <h1 className="mb-6 text-5xl font-bold tracking-tight">
            {t("title")}
          </h1>

          <p className="mb-8 text-lg text-gray-600">{t("description")}</p>

          <div className="flex gap-3">
            <Link
              href="/en/stores"
              className="rounded-lg bg-black px-5 py-3 font-medium text-white"
            >
              {t("browseStores")}
            </Link>

            <Link
              href="/en/register"
              className="rounded-lg border px-5 py-3 font-medium"
            >
              {t("startStore")}
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border bg-gray-50 p-8">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Platform features</h2>
            <ul className="space-y-3 text-gray-600">
              <li>Multiple stores</li>
              <li>Store owner dashboard</li>
              <li>Admin dashboard</li>
              <li>Monthly subscriptions</li>
              <li>Product management</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
