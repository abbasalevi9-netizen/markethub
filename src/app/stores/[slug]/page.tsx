import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";

type StoreProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  priceCents: number;
  currency: string;
  isAvailable: boolean;
  sizes: string | null;
  colors: string | null;
};

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const colorMap: Record<string, string> = {
  Black: "#000000",
  White: "#ffffff",
  Red: "#ef4444",
  Blue: "#3b82f6",
  Green: "#22c55e",
  Yellow: "#eab308",
  Gray: "#6b7280",
};

function getSizesList(sizes: string | null) {
  return sizes
    ? sizes
        .split(",")
        .map((size) => size.trim())
        .filter(Boolean)
        .slice(0, 4)
    : [];
}

function getColorsList(colors: string | null) {
  return colors
    ? colors
        .split(",")
        .map((color) => color.trim())
        .filter(Boolean)
        .slice(0, 4)
    : [];
}

export default async function StoreDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const store = await prisma.store.findFirst({
    where: {
      slug: decodedSlug,
      isPublished: true,
      subscription: {
        status: {
          in: ["ACTIVE", "TRIALING"],
        },
      },
    },
    include: {
      products: {
        where: {
          isActive: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!store) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f7efe3]">
      <section className="relative overflow-hidden border-b border-amber-200/70 bg-black text-white">
        <div className="absolute inset-0">
          <Image
            src={store.bannerUrl || "/hero-store.png"}
            alt={store.name}
            fill
            priority
            className="object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/20" />
        </div>

        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 py-16 text-center">
          <div className="mb-5 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-black text-3xl font-bold text-white shadow-2xl">
            {store.logoUrl ? (
              <Image
                src={store.logoUrl}
                alt={store.name}
                width={96}
                height={96}
                className="h-full w-full object-cover"
              />
            ) : (
              store.name.charAt(0).toUpperCase()
            )}
          </div>

          <h1 className="text-4xl font-extrabold md:text-5xl">{store.name}</h1>

          <p className="mt-4 max-w-2xl leading-8 text-white/80">
            {store.description || "متجر داخل MarketHub"}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold">Products</h2>
          <div className="mx-auto my-4 h-px w-40 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
        </div>

        {store.products.length === 0 ? (
          <div className="rounded-[2rem] border border-amber-200/70 bg-white/75 p-10 text-center text-stone-600 shadow-lg">
            No products yet
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 lg:gap-3">
            {store.products.map((product: StoreProduct) => {
              const sizes = getSizesList(product.sizes);
              const colors = getColorsList(product.colors);

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group block w-full overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="relative aspect-square bg-stone-100">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-stone-400">
                        No image
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/40 to-transparent" />

                    <span
                      className={`absolute start-1.5 top-1.5 rounded-full px-2 py-1 text-[9px] font-extrabold shadow-sm ${
                        product.isAvailable
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.isAvailable ? "متوفر" : "غير متوفر"}
                    </span>
                  </div>

                  <div className="p-2 text-right">
                    <h3 className="line-clamp-1 text-xs font-extrabold text-stone-900">
                      {product.name}
                    </h3>

                    {sizes.length > 0 && (
                      <div className="mt-2 flex flex-wrap justify-end gap-1">
                        {sizes.map((size) => (
                          <span
                            key={size}
                            className="rounded-full border border-stone-200 bg-stone-50 px-1.5 py-0.5 text-[9px] font-bold text-stone-700"
                          >
                            {size}
                          </span>
                        ))}
                      </div>
                    )}

                    {colors.length > 0 && (
                      <div className="mt-2 flex flex-wrap justify-end gap-1">
                        {colors.map((color) => (
                          <span
                            key={color}
                            className="h-3 w-3 rounded-full border border-stone-300"
                            style={{
                              backgroundColor: colorMap[color] || "#d1d5db",
                            }}
                            title={color}
                          />
                        ))}
                      </div>
                    )}

                    <p className="mt-2 w-fit rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-900">
                      {formatMoney(product.priceCents, product.currency)}
                    </p>

                    <span className="mt-2 block text-[10px] font-bold text-stone-700 group-hover:text-amber-700">
                      عرض المنتج
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
