import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { T } from "@/components/translated-text";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";

const categories = {
  sweaters: "SWEATERS",
  pants: "PANTS",
  shoes: "SHOES",
  thobes: "THOBES",
  shirts: "SHIRTS",
  jackets: "JACKETS",
  dresses: "DRESSES",
  kids: "KIDS",
  accessories: "ACCESSORIES",
  other: "OTHER",
} as const;

type PageProps = {
  params: Promise<{
    category: string;
  }>;
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

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;

  const categoryValue = categories[category as keyof typeof categories];

  if (!categoryValue) {
    notFound();
  }

  const products = await prisma.product.findMany({
    where: {
      category: categoryValue,
      isActive: true,
      store: {
        isPublished: true,
      },
    },
    include: {
      store: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-[#f7efe3] px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-[2rem] border border-amber-200/70 bg-white/75 p-6 text-right shadow-xl shadow-amber-950/10 md:mb-10 md:p-8">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-amber-700">
            MarketHub
          </p>

          <h1 className="text-3xl font-extrabold md:text-4xl">
            <T path={`categories.${categoryValue}`} />
          </h1>

          <div className="my-4 h-px w-32 bg-gradient-to-r from-transparent via-amber-500 to-transparent md:w-40" />

          <p className="max-w-2xl text-sm leading-7 text-stone-600 md:text-base">
            <T path="categoryPage.description" />{" "}
            <span className="font-bold text-stone-900">
              <T path={`categories.${categoryValue}`} />
            </span>
          </p>
        </div>

        {products.length === 0 ? (
          <div className="rounded-[2rem] border border-amber-200/70 bg-white/75 p-10 text-center text-stone-600 shadow-lg">
            <T path="categoryPage.noProducts" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
            {products.map((product) => {
              const sizes = getSizesList(product.sizes);

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-md shadow-amber-950/5 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-950/10 lg:rounded-3xl"
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
                        <T path="categoryPage.noImage" />
                      </div>
                    )}

                    {/* Gradient */}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent md:h-24" />

                    {/* Availability Badge */}
                    <span
                      className={`absolute start-2 top-2 rounded-full px-3 py-1 text-[10px] font-extrabold shadow-sm lg:text-xs ${
                        product.isAvailable
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      <T
                        path={
                          product.isAvailable
                            ? "product.available"
                            : "product.unavailable"
                        }
                      />
                    </span>

                    {/* Store Logo */}
                    <div className="absolute bottom-2 end-2 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-black text-xs font-bold text-white shadow-lg lg:h-12 lg:w-12 lg:text-sm">
                      {product.store.logoUrl ? (
                        <Image
                          src={product.store.logoUrl}
                          alt={product.store.name}
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        product.store.name.charAt(0).toUpperCase()
                      )}
                    </div>
                  </div>

                  <div className="p-3 text-right lg:p-4">
                    <p className="line-clamp-1 text-xs text-stone-500 lg:text-sm">
                      {product.store.name}
                    </p>

                    <h2 className="mt-1 line-clamp-1 text-sm font-extrabold lg:text-lg">
                      {product.name}
                    </h2>

                    {/* Sizes */}
                    {sizes.length > 0 && (
                      <div className="mt-2 flex flex-wrap justify-end gap-1">
                        {sizes.map((size) => (
                          <span
                            key={size}
                            className="rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 text-[10px] font-bold text-stone-700"
                          >
                            {size}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Description */}
                    {product.description && (
                      <p className="mt-2 hidden line-clamp-2 text-sm leading-6 text-stone-600 md:block">
                        {product.description}
                      </p>
                    )}

                    <div className="mt-3 flex flex-col gap-2 lg:mt-4 lg:flex-row lg:items-center lg:justify-between lg:gap-3">
                      <span className="w-fit rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-900 lg:px-3 lg:text-sm">
                        {formatMoney(product.priceCents, product.currency)}
                      </span>

                      <span className="text-xs font-bold text-stone-700 group-hover:text-amber-700 lg:text-sm">
                        <T path="categoryPage.viewProduct" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
