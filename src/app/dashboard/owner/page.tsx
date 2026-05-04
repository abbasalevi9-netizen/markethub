import Link from "next/link";
import { Role } from "@prisma/client";

import { updateStoreBrandingAction } from "@/actions/stores";
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
  const session = await requireRole(Role.STORE_OWNER);

  const store = await prisma.store.findFirst({
    where: { ownerId: session.user.id },
    include: {
      products: {
        orderBy: { createdAt: "desc" },
        include: { images: true },
      },
    },
  });

  if (!store) return null;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 space-y-10">
      {/* 🔥 NEW: WhatsApp Settings */}
      <div className="rounded-2xl border p-5 bg-white">
        <h2 className="text-lg font-bold mb-4">ربط واتساب</h2>

        <form action={updateStoreBrandingAction} className="space-y-3">
          <input type="hidden" name="name" value={store.name} />

          <input
            name="whatsappPhone"
            defaultValue={store.whatsappPhone || ""}
            placeholder="+905xxxxxxxxx"
            className="w-full rounded-xl border px-4 py-3"
          />

          <button className="rounded-xl bg-black text-white px-5 py-3 font-bold">
            حفظ رقم الواتساب
          </button>
        </form>

        <p className="text-xs text-gray-500 mt-2">
          هذا الرقم سيتم استخدامه لإضافة المنتجات عبر واتساب
        </p>
      </div>

      {/* PRODUCTS */}
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
                    className="h-40 w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="h-40 flex items-center justify-center bg-gray-100 rounded-xl text-sm text-gray-400">
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
              <div className="mt-4 space-y-3">
                {colorOptions.map((color) => {
                  const active = colors.includes(color.name);
                  const colorImage = product.images.find(
                    (i) => i.color === color.name,
                  );

                  return (
                    <div key={color.name}>
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
                              ? "border-black scale-110"
                              : "border-gray-200"
                          }`}
                          style={{ backgroundColor: color.value }}
                        />
                      </form>

                      {active && (
                        <form
                          action={updateProductColorImageAction.bind(
                            null,
                            product.id,
                            color.name,
                          )}
                          className="mt-2"
                        >
                          <input type="file" name="image" className="text-xs" />
                          <button className="text-xs bg-black text-white px-2 py-1 mt-1 rounded">
                            حفظ
                          </button>
                        </form>
                      )}
                    </div>
                  );
                })}
              </div>

              <p className="mt-3 text-sm">
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
