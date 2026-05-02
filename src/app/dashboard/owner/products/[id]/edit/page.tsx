import { notFound } from "next/navigation";
import { Role } from "@prisma/client";

import { updateProductAction } from "@/actions/products";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guards";
import { T } from "@/components/translated-text";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

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

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const session = await requireRole(Role.STORE_OWNER);

  const product = await prisma.product.findUnique({
    where: {
      id,
    },
    include: {
      store: true,
    },
  });

  if (!product || product.store.ownerId !== session.user.id) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-8 text-3xl font-bold">
        <T path="productForm.editTitle" />
      </h1>

      <form
        action={updateProductAction.bind(null, product.id)}
        encType="multipart/form-data"
        className="space-y-4 rounded-2xl border p-6"
      >
        <div>
          <label className="mb-1 block text-sm font-medium">
            <T path="productForm.productName" />
          </label>

          <input
            name="name"
            required
            defaultValue={product.name}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            <T path="productForm.category" />
          </label>

          <select
            name="category"
            defaultValue={product.category}
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

          <input
            name="description"
            defaultValue={product.description || ""}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            <T path="productForm.image" />
          </label>

          {product.imageUrl && (
            <div className="mb-3 overflow-hidden rounded-xl border">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-56 w-full object-cover"
              />
            </div>
          )}

          <input
            name="image"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="w-full rounded-lg border px-3 py-2"
          />

          <p className="mt-2 text-xs text-gray-500">
            اختر صورة جديدة فقط إذا كنت تريد تغيير صورة المنتج الحالية.
          </p>
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
            defaultValue={product.priceCents / 100}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            <T path="productForm.currency" />
          </label>

          <input
            name="currency"
            defaultValue={product.currency}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <button className="rounded-lg bg-black px-5 py-2 font-medium text-white">
          <T path="productForm.updateProduct" />
        </button>
      </form>
    </main>
  );
}
