"use client";

import Image from "next/image";
import Link from "next/link";

import { useLanguage } from "@/components/language-provider";

type HomeStore = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  location: string | null;
  websiteUrl: string | null;
  locationImageUrl: string | null;
  isFeatured: boolean;
  productsCount: number;
};

type HomeProduct = {
  id: string;
  name: string;
  slug: string;
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
  };
};

type HomePageClientProps = {
  stores: HomeStore[];
  featuredStore: HomeStore | null;
  locationStores: HomeStore[];
  products: HomeProduct[];
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

function getSizesList(sizes: string | null) {
  return sizes
    ? sizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 3)
    : [];
}

export function HomePageClient({
  stores,
  featuredStore,
  locationStores,
  products,
}: HomePageClientProps) {
  const { language } = useLanguage();

  const text =
    language === "ar"
      ? {
          productsTitle: "منتجات مختارة",
          productsSubtitle: "اكتشف منتجات من عدة متاجر",
          noProducts: "لا توجد منتجات",
          viewProduct: "عرض",
          available: "متوفر",
          unavailable: "غير متوفر",
        }
      : language === "tr"
        ? {
            productsTitle: "Seçili ürünler",
            productsSubtitle: "Farklı mağazalardan keşfet",
            noProducts: "Ürün yok",
            viewProduct: "Görüntüle",
            available: "Mevcut",
            unavailable: "Yok",
          }
        : {
            productsTitle: "Selected products",
            productsSubtitle: "Discover items from multiple stores",
            noProducts: "No products",
            viewProduct: "View",
            available: "Available",
            unavailable: "Unavailable",
          };

  const heroImage = "/hero-store.png";

  return (
    <section className="px-4 py-10 md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-extrabold md:text-3xl">
            {text.productsTitle}
          </h2>

          <p className="text-sm text-stone-500">{text.productsSubtitle}</p>
        </div>

        {products.length === 0 ? (
          <div className="text-center text-stone-500">{text.noProducts}</div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {products.map((product) => {
              const sizes = getSizesList(product.sizes);

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group overflow-hidden rounded-2xl border bg-white shadow-sm hover:shadow-lg"
                >
                  <div className="relative aspect-square">
                    <Image
                      src={product.imageUrl || heroImage}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />

                    {/* Availability */}
                    <span
                      className={`absolute start-1.5 top-1.5 rounded-full px-2 py-1 text-[10px] font-bold ${
                        product.isAvailable
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.isAvailable ? text.available : text.unavailable}
                    </span>

                    {/* Store Logo */}
                    <div className="absolute bottom-1.5 end-1.5 h-7 w-7 rounded-full overflow-hidden border bg-black">
                      {product.store.logoUrl && (
                        <Image
                          src={product.store.logoUrl}
                          alt={product.store.name}
                          width={28}
                          height={28}
                          className="object-cover"
                        />
                      )}
                    </div>
                  </div>

                  <div className="p-2 text-right">
                    <h3 className="text-xs font-bold line-clamp-1">
                      {product.name}
                    </h3>

                    {/* Sizes */}
                    {sizes.length > 0 && (
                      <div className="mt-1 flex flex-wrap justify-end gap-1">
                        {sizes.map((s) => (
                          <span
                            key={s}
                            className="text-[9px] bg-stone-100 px-1.5 py-0.5 rounded"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-amber-900">
                        {formatPrice(product.priceCents, product.currency)}
                      </span>

                      <span className="text-[10px] text-stone-600">
                        {text.viewProduct}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
