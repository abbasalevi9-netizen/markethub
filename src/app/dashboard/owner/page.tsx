import Link from "next/link";
import { Role } from "@prisma/client";

import { createStoreAction, updateStoreBrandingAction } from "@/actions/stores";
import {
  deleteProductAction,
  toggleProductAvailabilityAction,
  toggleProductSizeAction,
  toggleProductColorAction,
  updateProductColorImageAction,
} from "@/actions/products";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guards";
import { formatMoney } from "@/lib/money";

type PageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

const sizeOptions = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "38",
  "39",
  "40",
  "41",
  "42",
  "43",
  "44",
  "45",
];

const colorOptions = [
  { name: "Black", value: "#000000" },
  { name: "White", value: "#ffffff" },
  { name: "Red", value: "#ef4444" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#22c55e" },
  { name: "Yellow", value: "#eab308" },
  { name: "Gray", value: "#6b7280" },
];

function splitList(value: string | null) {
  return value
    ? value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean)
    : [];
}

export default async function OwnerDashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const session = await requireRole(Role.STORE_OWNER);

  const stores = await prisma.store.findMany({
    where: { ownerId: session.user.id },
    include: {
      subscription: true,
      products: {
        orderBy: { createdAt: "desc" },
        include: {
          images: true,
        },
      },
    },
  });

  const store = stores[0];

  if (!store) return null;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-6 text-3xl font-bold">{store.name}</h1>

      <div className="grid gap-4 md:grid-cols-3">
        {store.products.map((product) => {
          const sizes = splitList(product.sizes);
          const colors = splitList(product.colors);

          return (
            <div key={product.id} className="rounded-2xl border p-4">
              <div className="relative mb-4">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-40 w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-40 w-full items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-400">
                    لا توجد صورة
                  </div>
                )}

                <form
                  action={toggleProductAvailabilityAction.bind(
                    null,
                    product.id,
                  )}
                >
                  <button
                    className={`absolute start-2 top-2 rounded-full px-2 py-1 text-xs ${
                      product.isAvailable
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {product.isAvailable ? "متوفر" : "غير متوفر"}
                  </button>
                </form>
              </div>

              <h3 className="font-bold">{product.name}</h3>

              <div className="mt-3">
                <p className="mb-1 text-xs text-gray-500">المقاسات</p>

                <div className="flex flex-wrap gap-1">
                  {sizeOptions.map((size) => {
                    const active = sizes.includes(size);

                    return (
                      <form
                        key={size}
                        action={toggleProductSizeAction.bind(
                          null,
                          product.id,
                          size,
                        )}
                      >
                        <button
                          className={`rounded-full border px-2 py-1 text-xs ${
                            active
                              ? "bg-black text-white"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {size}
                        </button>
                      </form>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4">
                <p className="mb-1 text-xs text-gray-500">الألوان + الصور</p>

                <div className="space-y-3">
                  {colorOptions.map((color) => {
                    const active = colors.includes(color.name);
                    const colorImage = product.images.find(
                      (image) => image.color === color.name,
                    );

                    return (
                      <div
                        key={color.name}
                        className="rounded-xl border border-gray-100 bg-gray-50 p-2"
                      >
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <form
                            action={toggleProductColorAction.bind(
                              null,
                              product.id,
                              color.name,
                            )}
                          >
                            <button
                              className={`h-7 w-7 rounded-full border-2 ${
                                active
                                  ? "scale-110 border-black"
                                  : "border-gray-200"
                              }`}
                              style={{ backgroundColor: color.value }}
                              title={color.name}
                            />
                          </form>

                          <span className="text-xs font-bold text-gray-600">
                            {color.name}
                          </span>
                        </div>

                        {active && (
                          <div className="space-y-2">
                            {colorImage ? (
                              <img
                                src={colorImage.imageUrl}
                                alt={`${product.name} ${color.name}`}
                                className="h-20 w-full rounded-lg object-cover"
                              />
                            ) : (
                              <div className="flex h-20 items-center justify-center rounded-lg bg-white text-[11px] text-gray-400">
                                لا توجد صورة لهذا اللون
                              </div>
                            )}

                            <form
                              action={updateProductColorImageAction.bind(
                                null,
                                product.id,
                                color.name,
                              )}
                              className="space-y-2"
                            >
                              <input
                                type="file"
                                name="image"
                                accept="image/png,image/jpeg,image/webp,image/gif"
                                className="w-full rounded-lg border bg-white px-2 py-1 text-[11px]"
                              />

                              <button className="w-full rounded-lg bg-black px-3 py-2 text-xs font-bold text-white">
                                حفظ صورة اللون
                              </button>
                            </form>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <p className="mt-3 line-clamp-2 text-sm text-gray-600">
                {product.description}
              </p>

              <p className="mt-2 font-bold">
                {formatMoney(product.priceCents, product.currency)}
              </p>

              <div className="mt-4 flex gap-2">
                <Link
                  href={`/dashboard/owner/products/${product.id}/edit`}
                  className="rounded border px-3 py-1"
                >
                  تعديل
                </Link>

                <form action={deleteProductAction.bind(null, product.id)}>
                  <button className="rounded border px-3 py-1 text-red-600">
                    حذف
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
