import { Role } from "@prisma/client";

import { createProductAction } from "@/actions/products";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guards";
import { T } from "@/components/translated-text";

const categories = [
  "SWEATERS",
  "PANTS",
  "SHOES",
  "THOBES",
  "SHIRTS",
  "JACKETS",
  "DRESSES",
  "KIDS",
  "ACCESSORIES",
  "OTHER",
] as const;

export default async function NewProductPage() {
  const session = await requireRole(Role.STORE_OWNER);

  const store = await prisma.store.findFirst({
    where: {
      ownerId: session.user.id,
    },
  });

  if (!store) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-3xl font-bold">
          <T path="productForm.addTitle" />
        </h1>

        <p className="mt-4 text-gray-600">
          <T path="productForm.createStoreFirst" />
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-8 text-3xl font-bold">
        <T path="productForm.addTitle" />
      </h1>

      <form
        action={createProductAction}
        className="space-y-4 rounded-2xl border p-6"
      >
        <input type="hidden" name="storeId" value={store.id} />

        <div>
          <label className="mb-1 block text-sm font-medium">
            <T path="productForm.productName" />
          </label>

          <input
            name="name"
            required
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            <T path="productForm.category" />
          </label>

          <select
            name="category"
            defaultValue="OTHER"
            required
            className="w-full rounded-lg border bg-white px-3 py-2"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                <T path={`categories.${category}`} />
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            <T path="productForm.description" />
          </label>

          <textarea
            name="description"
            rows={4}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            القياسات الموجودة
          </label>

          <input
            name="sizes"
            className="w-full rounded-lg border px-3 py-2"
            placeholder="مثال: S, M, L, XL أو 38, 39, 40"
          />

          <p className="mt-1 text-xs text-gray-500">
            اكتب القياسات وافصل بينها بفاصلة.
          </p>
        </div>

        <div className="rounded-xl border bg-gray-50 p-4">
          <label className="flex items-center gap-3 text-sm font-medium">
            <input
              name="isAvailable"
              type="checkbox"
              defaultChecked
              className="h-4 w-4"
            />

            <span>المنتج متوفر حاليًا</span>
          </label>

          <p className="mt-2 text-xs text-gray-500">
            إذا أزلت علامة الصح سيظهر المنتج للزوار بحالة غير متوفر.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            <T path="productForm.image" />
          </label>

          <input
            name="image"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            <T path="productForm.price" />
          </label>

          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            required
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            <T path="productForm.currency" />
          </label>

          <input
            name="currency"
            defaultValue="usd"
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <button className="rounded-lg bg-black px-5 py-2 font-medium text-white">
          <T path="productForm.createProduct" />
        </button>
      </form>
    </main>
  );
}
