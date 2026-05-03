import Link from "next/link";
import { Role } from "@prisma/client";

import { createStoreAction, updateStoreBrandingAction } from "@/actions/stores";
import { deleteProductAction } from "@/actions/products";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guards";
import { formatMoney } from "@/lib/money";
import { T } from "@/components/translated-text";

type PageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function OwnerDashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const session = await requireRole(Role.STORE_OWNER);

  const stores = await prisma.store.findMany({
    where: {
      ownerId: session.user.id,
    },
    include: {
      subscription: true,
      products: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const store = stores[0];

  const errorMessagePath =
    params?.error === "invalid-store-data"
      ? "errors.invalidStoreData"
      : params?.error === "store-already-exists"
        ? "errors.storeAlreadyExists"
        : null;

  if (!store) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="mb-2 text-3xl font-bold">
          <T path="ownerDashboard.createTitle" />
        </h1>

        <p className="mb-8 text-gray-600">
          <T path="ownerDashboard.createDescription" />
        </p>

        {errorMessagePath && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <T path={errorMessagePath} />
          </div>
        )}

        <form
          action={createStoreAction}
          className="space-y-4 rounded-2xl border p-6"
        >
          <div>
            <label className="mb-1 block text-sm font-medium">
              <T path="ownerDashboard.storeName" />
            </label>

            <input
              name="name"
              required
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Example: Ahmed Electronics"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              <T path="ownerDashboard.description" />
            </label>

            <input
              name="description"
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Describe your store"
            />
          </div>

          <button className="rounded-lg bg-black px-5 py-2 font-medium text-white">
            <T path="ownerDashboard.createStore" />
          </button>
        </form>
      </main>
    );
  }

  const isActive =
    store.subscription?.status === "ACTIVE" ||
    store.subscription?.status === "TRIALING";

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">{store.name}</h1>

          <p className="text-gray-600">{store.description}</p>

          <div className="mt-3 space-y-1 text-sm text-gray-600">
            <p>
              <T path="ownerDashboard.publicUrl" />:{" "}
              <Link href={`/stores/${store.slug}`} className="underline">
                /stores/{store.slug}
              </Link>
            </p>

            {store.location && (
              <p>
                <T path="ownerDashboard.location" />: {store.location}
              </p>
            )}

            {store.websiteUrl && (
              <p>
                <T path="ownerDashboard.websiteUrl" />:{" "}
                <a
                  href={store.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  {store.websiteUrl}
                </a>
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href="/dashboard/owner/billing"
            className="rounded-lg border px-4 py-2"
          >
            <T path="ownerDashboard.billing" />
          </Link>

          <Link
            href="/dashboard/owner/products/new"
            className="rounded-lg bg-black px-4 py-2 text-white"
          >
            <T path="ownerDashboard.addProduct" />
          </Link>
        </div>
      </div>

      <section className="mb-8 overflow-hidden rounded-3xl border bg-white shadow-sm">
        <div className="relative h-56 bg-gray-100">
          {store.bannerUrl ? (
            <img
              src={store.bannerUrl}
              alt={`${store.name} banner`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              <T path="ownerDashboard.noBanner" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 p-6 md:flex-row md:items-end md:justify-between">
          <div className="flex items-end gap-4">
            <div className="-mt-16 flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-black text-4xl font-bold text-white shadow-sm">
              {store.logoUrl ? (
                <img
                  src={store.logoUrl}
                  alt={`${store.name} logo`}
                  className="h-full w-full object-cover"
                />
              ) : (
                store.name.charAt(0).toUpperCase()
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold">{store.name}</h2>
              <p className="text-sm text-gray-500">
                <T path="ownerDashboard.brandingDescription" />
              </p>
            </div>
          </div>
        </div>
      </section>

      <form
        action={updateStoreBrandingAction}
        className="mb-8 rounded-2xl border bg-white p-6 shadow-sm"
      >
        <h2 className="mb-4 text-xl font-semibold">
          <T path="ownerDashboard.brandingTitle" />
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">
              <T path="ownerDashboard.storeName" />
            </label>

            <input
              name="name"
              required
              defaultValue={store.name}
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Store name"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">
              <T path="ownerDashboard.storeName" />
            </label>

            <input
              name="name"
              required
              defaultValue={store.name}
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Store name"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              <T path="ownerDashboard.logo" />
            </label>

            <input
              name="logo"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              <T path="ownerDashboard.banner" />
            </label>

            <input
              name="banner"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              <T path="ownerDashboard.location" />
            </label>

            <input
              name="location"
              defaultValue={store.location ?? ""}
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Istanbul, Fatih"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              <T path="ownerDashboard.websiteUrl" />
            </label>

            <input
              name="websiteUrl"
              type="url"
              defaultValue={store.websiteUrl ?? ""}
              className="w-full rounded-lg border px-3 py-2"
              placeholder="https://example.com"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">
              <T path="ownerDashboard.locationImage" />
            </label>

            <input
              name="locationImage"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>
        </div>

        {store.locationImageUrl && (
          <div className="mt-5 overflow-hidden rounded-2xl border">
            <img
              src={store.locationImageUrl}
              alt={`${store.name} location`}
              className="h-44 w-full object-cover"
            />
          </div>
        )}

        <button className="mt-5 rounded-lg bg-black px-5 py-2 font-medium text-white">
          <T path="ownerDashboard.saveBranding" />
        </button>
      </form>

      <div className="mb-8 rounded-2xl border p-5">
        <p className="text-sm text-gray-500">
          <T path="ownerDashboard.subscriptionStatus" />
        </p>

        <p className="text-xl font-semibold">
          {store.subscription?.status || "INACTIVE"}
        </p>

        {!isActive && (
          <p className="mt-2 text-sm text-red-600">
            <T path="ownerDashboard.inactiveWarning" />
          </p>
        )}
      </div>

      <section>
        <h2 className="mb-4 text-xl font-semibold">
          <T path="ownerDashboard.products" />
        </h2>

        {store.products.length === 0 ? (
          <div className="rounded-2xl border p-8 text-center text-gray-600">
            <T path="ownerDashboard.noProducts" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {store.products.map((product) => (
              <div key={product.id} className="rounded-2xl border p-4">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="mb-4 h-40 w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="mb-4 flex h-40 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                    <T path="ownerDashboard.noImage" />
                  </div>
                )}

                <h3 className="font-semibold">{product.name}</h3>

                <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                  {product.description}
                </p>

                <p className="mt-3 font-bold">
                  {formatMoney(product.priceCents, product.currency)}
                </p>

                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/dashboard/owner/products/${product.id}/edit`}
                    className="rounded-lg border px-3 py-2 text-sm"
                  >
                    <T path="ownerDashboard.edit" />
                  </Link>

                  <form action={deleteProductAction.bind(null, product.id)}>
                    <button className="rounded-lg border px-3 py-2 text-sm text-red-600">
                      <T path="ownerDashboard.delete" />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
