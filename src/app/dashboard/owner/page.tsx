import Link from "next/link";
import { Role } from "@prisma/client";

import { createStoreAction, updateStoreBrandingAction } from "@/actions/stores";
import {
  deleteProductAction,
  toggleProductAvailabilityAction,
  toggleProductSizeAction,
  toggleProductColorAction,
} from "@/actions/products";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guards";
import { formatMoney } from "@/lib/money";
import { T } from "@/components/translated-text";

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
      products: { orderBy: { createdAt: "desc" } },
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
              {/* IMAGE */}
              <div className="relative mb-4">
                <img
                  src={product.imageUrl || ""}
                  className="h-40 w-full object-cover rounded-xl"
                />

                <form
                  action={toggleProductAvailabilityAction.bind(
                    null,
                    product.id,
                  )}
                >
                  <button
                    className={`absolute top-2 start-2 px-2 py-1 text-xs rounded-full ${
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

              {/* SIZES */}
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-1">المقاسات</p>

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
                          className={`px-2 py-1 text-xs rounded-full border ${
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

              {/* COLORS */}
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-1">الألوان</p>

                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => {
                    const active = colors.includes(color.name);

                    return (
                      <form
                        key={color.name}
                        action={toggleProductColorAction.bind(
                          null,
                          product.id,
                          color.name,
                        )}
                      >
                        <button
                          className={`h-6 w-6 rounded-full border-2 ${
                            active
                              ? "border-black scale-110"
                              : "border-gray-200"
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      </form>
                    );
                  })}
                </div>
              </div>

              <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                {product.description}
              </p>

              <p className="mt-2 font-bold">
                {formatMoney(product.priceCents, product.currency)}
              </p>

              <div className="mt-4 flex gap-2">
                <Link
                  href={`/dashboard/owner/products/${product.id}/edit`}
                  className="border px-3 py-1 rounded"
                >
                  تعديل
                </Link>

                <form action={deleteProductAction.bind(null, product.id)}>
                  <button className="border px-3 py-1 rounded text-red-600">
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
