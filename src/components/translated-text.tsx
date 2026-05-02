"use client";

import { useLanguage } from "@/components/language-provider";

function getNestedValue(obj: unknown, path: string): string | undefined {
  return path.split(".").reduce<unknown>((current, key) => {
    if (typeof current === "object" && current !== null && key in current) {
      return (current as Record<string, unknown>)[key];
    }

    return undefined;
  }, obj) as string | undefined;
}

export function T({
  path,
  values,
}: {
  path: string;
  values?: Record<string, string | number>;
}) {
  const { t } = useLanguage();

  let text = getNestedValue(t, path) ?? path;

  if (values) {
    for (const [key, value] of Object.entries(values)) {
      text = text.replaceAll(`{${key}}`, String(value));
    }
  }

  return <>{text}</>;
}
