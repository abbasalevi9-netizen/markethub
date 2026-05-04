"use server";

import { randomUUID } from "crypto";

import { put } from "@vercel/blob";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guards";
import { slugify } from "@/lib/slug";

const productCategories = [
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

const productSchema = z.object({
  storeId: z.string().min(1),
  name: z.string().min(2),
  description: z.string().optional(),
  category: z.enum(productCategories).default("OTHER"),
  sizes: z.string().optional(),
  isAvailable: z.boolean().default(true),
  price: z.coerce.number().positive(),
  currency: z.string().default("usd"),
});

const updateProductSchema = productSchema.omit({
  storeId: true,
});

async function saveProductImage(image: FormDataEntryValue | null) {
  if (!(image instanceof File) || image.size === 0) {
    return null;
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  if (!allowedTypes.includes(image.type)) {
    throw new Error("Invalid image type");
  }

  const maxSizeInBytes = 5 * 1024 * 1024;

  if (image.size > maxSizeInBytes) {
    throw new Error("Image size must be less than 5MB");
  }

  const extension =
    image.type.split("/")[1] === "jpeg" ? "jpg" : image.type.split("/")[1];

  const fileName = `products/${randomUUID()}.${extension}`;

  const blob = await put(fileName, image, {
    access: "public",
    contentType: image.type,
  });

  return blob.url;
}

async function assertStoreOwner(storeId: string, userId: string) {
  const store = await prisma.store.findFirst({
    where: {
      id: storeId,
      ownerId: userId,
    },
  });

  if (!store) {
    throw new Error("Store not found or access denied");
  }

  return store;
}

async function createUniqueProductSlug(storeId: string, name: string) {
  const baseSlug = slugify(name);
  let slug = baseSlug || `product-${Date.now()}`;
  let counter = 1;

  while (
    await prisma.product.findUnique({
      where: {
        storeId_slug: {
          storeId,
          slug,
        },
      },
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

export async function createProductAction(formData: FormData) {
  const session = await requireRole(Role.STORE_OWNER);

  const parsed = productSchema.safeParse({
    storeId: formData.get("storeId"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    category: formData.get("category") || "OTHER",
    sizes: formData.get("sizes") || undefined,
    isAvailable: formData.get("isAvailable") === "on",
    price: formData.get("price"),
    currency: formData.get("currency") || "usd",
  });

  if (!parsed.success) {
    throw new Error("Invalid product data");
  }

  const store = await assertStoreOwner(parsed.data.storeId, session.user.id);
  const slug = await createUniqueProductSlug(store.id, parsed.data.name);
  const imageUrl = await saveProductImage(formData.get("image"));

  await prisma.product.create({
    data: {
      storeId: store.id,
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      category: parsed.data.category,
      sizes: parsed.data.sizes?.trim() || null,
      isAvailable: parsed.data.isAvailable,
      imageUrl,
      priceCents: Math.round(parsed.data.price * 100),
      currency: parsed.data.currency.toLowerCase(),
    },
  });

  revalidatePath("/");
  revalidatePath("/stores");
  revalidatePath("/dashboard/owner");
  revalidatePath(`/stores/${encodeURIComponent(store.slug)}`);
  revalidatePath(`/categories/${parsed.data.category.toLowerCase()}`);

  redirect("/dashboard/owner");
}

export async function updateProductAction(
  productId: string,
  formData: FormData,
) {
  const session = await requireRole(Role.STORE_OWNER);

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { store: true },
  });

  if (!product || product.store.ownerId !== session.user.id) {
    throw new Error("Product not found or access denied");
  }

  const parsed = updateProductSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    category: formData.get("category") || "OTHER",
    sizes: formData.get("sizes") || undefined,
    isAvailable: formData.get("isAvailable") === "on",
    price: formData.get("price"),
    currency: formData.get("currency") || "usd",
  });

  if (!parsed.success) {
    throw new Error("Invalid product data");
  }

  const uploadedImageUrl = await saveProductImage(formData.get("image"));

  await prisma.product.update({
    where: { id: product.id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      category: parsed.data.category,
      sizes: parsed.data.sizes?.trim() || null,
      isAvailable: parsed.data.isAvailable,
      imageUrl: uploadedImageUrl ?? product.imageUrl,
      priceCents: Math.round(parsed.data.price * 100),
      currency: parsed.data.currency.toLowerCase(),
    },
  });

  revalidatePath("/");
  revalidatePath("/stores");
  revalidatePath("/dashboard/owner");
  revalidatePath(`/stores/${encodeURIComponent(product.store.slug)}`);
  revalidatePath(`/categories/${product.category.toLowerCase()}`);
  revalidatePath(`/categories/${parsed.data.category.toLowerCase()}`);

  redirect("/dashboard/owner");
}

export async function deleteProductAction(productId: string) {
  const session = await requireRole(Role.STORE_OWNER);

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { store: true },
  });

  if (!product || product.store.ownerId !== session.user.id) {
    throw new Error("Product not found or access denied");
  }

  await prisma.product.delete({
    where: { id: product.id },
  });

  revalidatePath("/");
  revalidatePath("/stores");
  revalidatePath("/dashboard/owner");
  revalidatePath(`/stores/${encodeURIComponent(product.store.slug)}`);
  revalidatePath(`/categories/${product.category.toLowerCase()}`);
}
