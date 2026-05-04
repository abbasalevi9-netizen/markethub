"use client";

import Image from "next/image";
import Link from "next/link";

import { useLanguage } from "@/components/language-provider";

type ProductDetailsClientProps = {
  product: {
    name: string;
    description: string | null;
    imageUrl: string | null;
    priceCents: number;
    currency: string;
    isAvailable: boolean;
    sizes: string | null;
    store: {
      name: string;
      slug: string;
      logoUrl: string | null;
      bannerUrl: string | null;
    };
  };
};

function formatPrice(priceCents: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(priceCents / 100);
  } catch {
    return `${(priceCents / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}

export function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const { language } = useLanguage();

  const text =
    language === "ar"
      ? {
          backHome: "الرجوع للرئيسية",
          store: "المتجر",
          noDescription: "لا يوجد وصف لهذا المنتج حاليًا.",
          openStore: "فتح المتجر",
          viewStoreProducts: "مشاهدة منتجات المتجر",
          available: "متوفر",
          unavailable: "غير متوفر",
          sizes: "المقاسات",
        }
      : language === "tr"
        ? {
            backHome: "Ana sayfaya dön",
            store: "Mağaza",
            noDescription: "Bu ürün için henüz açıklama yok.",
            openStore: "Mağazayı aç",
            viewStoreProducts: "Mağaza ürünlerini gör",
            available: "Mevcut",
            unavailable: "Mevcut değil",
            sizes: "Bedenler",
          }
        : {
            backHome: "Back to home",
            store: "Store",
            noDescription: "No description is available for this product yet.",
            openStore: "Open store",
            viewStoreProducts: "View store products",
            available: "Available",
            unavailable: "Unavailable",
            sizes: "Sizes",
          };

  const fallbackImage = product.store.bannerUrl || "/hero-store.png";

  return (
    <main className="min-h-screen bg-[#f7efe3] px-4 py-10 md:px-6">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="mb-6 inline-flex rounded-full border border-amber-200 bg-white/70 px-4 py-2 text-sm font-bold text-amber-900 transition hover:bg-amber-300 hover:text-black"
        >
          ← {text.backHome}
        </Link>

        <section className="grid gap-8 rounded-[2rem] border border-amber-200/70 bg-white/80 p-4 shadow-2xl shadow-amber-950/10 md:grid-cols-2 md:p-6">
          <div className="relative aspect-square overflow-hidden rounded-[1.5rem] bg-stone-100">
            <Image
              src={product.imageUrl || fallbackImage}
              alt={product.name}
              fill
              priority
              className="object-cover"
            />
          </div>

          <div className="flex flex-col justify-center text-right">
            <div className="mb-5 flex items-center justify-end gap-3">
              <div>
                <p className="text-sm font-bold text-amber-700">{text.store}</p>
                <h2 className="text-lg font-extrabold">{product.store.name}</h2>
              </div>

              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-black text-lg font-bold text-white shadow-md">
                {product.store.logoUrl ? (
                  <Image
                    src={product.store.logoUrl}
                    alt={product.store.name}
                    width={56}
                    height={56}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  product.store.name.charAt(0).toUpperCase()
                )}
              </div>
            </div>

            <h1 className="text-3xl font-extrabold leading-tight md:text-5xl">
              {product.name}
            </h1>

            <p className="mt-5 rounded-2xl bg-amber-100 px-5 py-3 text-xl font-extrabold text-amber-950">
              {formatPrice(product.priceCents, product.currency)}
            </p>

            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <span
                className={`rounded-full px-4 py-2 text-sm font-extrabold ${
                  product.isAvailable
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {product.isAvailable ? text.available : text.unavailable}
              </span>

              {product.sizes ? (
                <span className="rounded-full bg-stone-100 px-4 py-2 text-sm font-bold text-stone-700">
                  {text.sizes}: {product.sizes}
                </span>
              ) : null}
            </div>

            <p className="mt-5 leading-8 text-stone-600">
              {product.description || text.noDescription}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Link
                href={`/stores/${product.store.slug}`}
                className="rounded-2xl bg-black px-6 py-4 text-center font-extrabold text-white shadow-lg transition hover:bg-amber-900"
              >
                {text.openStore}
              </Link>

              <Link
                href={`/stores/${product.store.slug}`}
                className="rounded-2xl border border-amber-300 bg-amber-100 px-6 py-4 text-center font-extrabold text-amber-950 transition hover:bg-amber-300"
              >
                {text.viewStoreProducts}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
