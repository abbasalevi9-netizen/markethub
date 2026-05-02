"use client";

import { languages, type Language } from "@/lib/translations";
import { useLanguage } from "@/components/language-provider";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative">
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as Language)}
        className="h-10 cursor-pointer appearance-none rounded-full border border-black/10 bg-white px-4 pe-9 text-sm font-medium text-gray-800 shadow-sm outline-none transition hover:bg-gray-50 focus:border-black"
        aria-label="Select language"
      >
        {Object.entries(languages).map(([code, name]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>

      <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
        ▼
      </span>
    </div>
  );
}
