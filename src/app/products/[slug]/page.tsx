import { notFound } from "next/navigation";

import { ProductDetailsClient } from "@/components/product-details-client";
import { prisma } from "@/lib/prisma";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const decodedSlug = decodeURIComponent(slug);

  const product = await prisma.product.findFirst({
    where: {
      slug: decodedSlug,
    },
    include: {
      images: {
        select: {
          color: true,
          imageUrl: true,
        },
      },
      store: {
        select: {
          name: true,
          slug: true,
          logoUrl: true,
          bannerUrl: true,
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <ProductDetailsClient
      product={{
        name: product.name,
        description: product.description,
        imageUrl: product.imageUrl,
        priceCents: product.priceCents,
        currency: product.currency,
        isAvailable: product.isAvailable,
        sizes: product.sizes,
        colors: product.colors,
        colorImages: product.images,
        store: {
          name: product.store.name,
          slug: product.store.slug,
          logoUrl: product.store.logoUrl,
          bannerUrl: product.store.bannerUrl,
        },
      }}
    />
  );
}
