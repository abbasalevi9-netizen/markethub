"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { loginAction } from "@/actions/auth";
import { useLanguage } from "@/components/language-provider";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const isRegistered = searchParams.get("registered") === "1";
  const isInvalidCredentials =
    searchParams.get("error") === "invalid-credentials";

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="mb-2 text-3xl font-bold">{t.auth.loginTitle}</h1>

      <p className="mb-8 text-gray-600">{t.auth.loginDescription}</p>

      {isRegistered && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {t.auth.registrationSuccess}
        </div>
      )}

      {isInvalidCredentials && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {t.auth.invalidCredentials}
        </div>
      )}

      <form action={loginAction} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">
            {t.auth.email}
          </label>

          <input
            name="email"
            type="email"
            required
            className="w-full rounded-lg border px-3 py-2"
            placeholder={t.auth.emailPlaceholder}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            {t.auth.password}
          </label>

          <input
            name="password"
            type="password"
            required
            className="w-full rounded-lg border px-3 py-2"
            placeholder={t.auth.passwordPlaceholder}
          />
        </div>

        <button className="w-full rounded-lg bg-black px-4 py-2 font-medium text-white">
          {t.auth.loginButton}
        </button>
      </form>

      <p className="mt-6 text-sm text-gray-600">
        {t.auth.noAccount}{" "}
        <Link href="/register" className="font-medium text-black underline">
          {t.auth.register}
        </Link>
      </p>
    </main>
  );
}
