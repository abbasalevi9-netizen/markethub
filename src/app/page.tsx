import { HomePageClient } from "@/components/home-page-client";
import { prisma } from "@/lib/prisma";

function mapStore(store: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  location: string | null;
  websiteUrl: string | null;
  locationImageUrl: string | null;
  isFeatured: boolean;
  _count: {
    products: number;
  };
}) {
  return {
    id: store.id,
    name: store.name,
    slug: store.slug,
    description: store.description,
    logoUrl: store.logoUrl,
    bannerUrl: store.bannerUrl,
    location: store.location,
    websiteUrl: store.websiteUrl,
    locationImageUrl: store.locationImageUrl,
    isFeatured: store.isFeatured,
    productsCount: store._count.products,
  };
}

export default async function HomePage() {
  const now = new Date();

  const stores = await prisma.store.findMany({
    where: {
      showOnHome: true,
      isPublished: true,
    },
    take: 6,
    orderBy: [
      {
        homeSort: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  const featuredStore =
    (await prisma.store.findFirst({
      where: {
        isFeatured: true,
        showOnHome: true,
        isPublished: true,
        OR: [{ featuredUntil: null }, { featuredUntil: { gt: now } }],
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    })) ??
    stores[0] ??
    null;

  const locationStores = await prisma.store.findMany({
    where: {
      showOnHome: true,
      isPublished: true,
      OR: [
        { location: { not: null } },
        { websiteUrl: { not: null } },
        { locationImageUrl: { not: null } },
      ],
    },
    take: 4,
    orderBy: [
      {
        homeSort: "asc",
      },
      {
        updatedAt: "desc",
      },
    ],
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  const featuredProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      store: {
        showOnHome: true,
        isPublished: true,
      },
    },
    take: 8,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      store: true,
    },
  });

  return (
    <HomePageClient
      stores={stores.map(mapStore)}
      featuredStore={featuredStore ? mapStore(featuredStore) : null}
      locationStores={locationStores.map(mapStore)}
      products={featuredProducts.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        imageUrl: product.imageUrl,
        priceCents: product.priceCents,
        currency: product.currency,
        isAvailable: product.isAvailable,
        sizes: product.sizes,
        colors: product.colors,
        store: {
          name: product.store.name,
          slug: product.store.slug,
          logoUrl: product.store.logoUrl,
        },
      }))}
    />
  );
}
