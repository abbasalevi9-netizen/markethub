import Link from "next/link";
import { Role } from "@prisma/client";

import { updateStoreBrandingAction } from "@/actions/stores";
import {
  deleteProductAction,
  toggleProductAvailabilityAction,
  toggleProductSizeAction,
  toggleProductColorAction,
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
    <main className="mx-auto max-w-6xl space-y-10 px-6 py-10">
      <div className="rounded-2xl border bg-white p-5">
        <h2 className="mb-4 text-lg font-bold">ربط واتساب</h2>

        <form action={updateStoreBrandingAction} className="space-y-3">
          <input type="hidden" name="name" value={store.name} />

          <input
            name="whatsappPhone"
            defaultValue={store.whatsappPhone || ""}
            placeholder="+905xxxxxxxxx"
            className="w-full rounded-xl border px-4 py-3"
          />

          <button className="rounded-xl bg-black px-5 py-3 font-bold text-white">
            حفظ رقم الواتساب
          </button>
        </form>

        <p className="mt-2 text-xs text-gray-500">
          هذا الرقم سيتم استخدامه لإضافة المنتجات عبر واتساب
        </p>
      </div>

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
                  <div className="flex h-40 items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-400">
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
                <p className="mb-2 text-xs text-gray-500">الألوان</p>

                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => {
                    const active = colors.includes(color.name);
                    const hasImage = product.images.some(
                      (image) => image.color === color.name,
                    );

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
                          title={
                            hasImage
                              ? `${color.name} - يوجد صورة`
                              : `${color.name} - لا توجد صورة`
                          }
                          className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 transition ${
                            active
                              ? "scale-110 border-black opacity-100"
                              : "border-gray-200 opacity-35"
                          }`}
                          style={{ backgroundColor: color.value }}
                        >
                          {!active ? (
                            <span className="text-xs font-black text-white drop-shadow">
                              ×
                            </span>
                          ) : null}

                          {active && hasImage ? (
                            <span className="absolute -bottom-1 -end-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-600 text-[10px] font-bold text-white">
                              ✓
                            </span>
                          ) : null}
                        </button>
                      </form>
                    );
                  })}
                </div>

                <p className="mt-2 text-[11px] text-gray-400">
                  الصور تُضاف من واتساب. اضغط اللون لإظهاره أو إخفائه.
                </p>
              </div>

              <p className="mt-3 text-sm">
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
