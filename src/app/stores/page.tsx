import Link from "next/link";

import { prisma } from "@/lib/prisma";

export default async function StoresPage() {
  const stores = await prisma.store.findMany({
    where: {
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
        take: 3,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-8 text-3xl font-bold">Stores</h1>

      {stores.length === 0 ? (
        <div className="rounded-2xl border p-8 text-center text-gray-600">
          No active stores yet.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-3">
          {stores.map((store) => (
            <Link
              key={store.id}
              href={`/stores/${store.slug}`}
              className="rounded-2xl border p-5 transition hover:shadow-sm"
            >
              <div className="mb-4 flex h-32 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                {store.logoUrl ? (
                  <img
                    src={store.logoUrl}
                    alt={store.name}
                    className="h-full w-full rounded-xl object-cover"
                  />
                ) : (
                  "Store"
                )}
              </div>

              <h2 className="text-xl font-semibold">{store.name}</h2>
              <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                {store.description}
              </p>

              <p className="mt-4 text-sm text-gray-500">
                {store.products.length} sample products
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
