"use client";

import Link from "next/link";

import { registerAction } from "@/actions/auth";
import { useLanguage } from "@/components/language-provider";

export default function RegisterPage() {
  const { t } = useLanguage();

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="mb-2 text-3xl font-bold">{t.register.title}</h1>

      <p className="mb-8 text-gray-600">{t.register.description}</p>

      <form action={registerAction} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">
            {t.register.name}
          </label>

          <input
            name="name"
            required
            className="w-full rounded-lg border px-3 py-2"
            placeholder={t.register.name}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            {t.register.email}
          </label>

          <input
            name="email"
            type="email"
            required
            className="w-full rounded-lg border px-3 py-2"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            {t.register.password}
          </label>

          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full rounded-lg border px-3 py-2"
            placeholder={t.register.password}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            {t.register.role}
          </label>

          <select
            name="role"
            required
            className="w-full rounded-lg border px-3 py-2"
          >
            <option value="CUSTOMER">{t.register.customer}</option>
            <option value="STORE_OWNER">{t.register.storeOwner}</option>
          </select>
        </div>

        <button className="w-full rounded-lg bg-black px-4 py-2 font-medium text-white">
          {t.register.createAccount}
        </button>
      </form>

      <p className="mt-6 text-sm text-gray-600">
        {t.register.alreadyHaveAccount}{" "}
        <Link href="/login" className="font-medium text-black underline">
          {t.register.login}
        </Link>
      </p>
    </main>
  );
}
