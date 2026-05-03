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

const createStoreSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});

const storeBrandingSchema = z.object({
  name: z.string().min(2),
  location: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
});

async function saveStoreImage(image: FormDataEntryValue | null) {
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

  const fileName = `stores/${randomUUID()}.${extension}`;

  const blob = await put(fileName, image, {
    access: "public",
    contentType: image.type,
  });

  return blob.url;
}

async function createUniqueStoreSlug(name: string) {
  const baseSlug = slugify(name);
  let slug = baseSlug || `store-${Date.now()}`;
  let counter = 1;

  while (await prisma.store.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

export async function createStoreAction(formData: FormData) {
  const session = await requireRole(Role.STORE_OWNER);

  const parsed = createStoreSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    redirect("/dashboard/owner?error=invalid-store-data");
  }

  const existingStore = await prisma.store.findFirst({
    where: {
      ownerId: session.user.id,
    },
  });

  if (existingStore) {
    redirect("/dashboard/owner?error=store-already-exists");
  }

  const slug = await createUniqueStoreSlug(parsed.data.name);

  await prisma.store.create({
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      ownerId: session.user.id,
      subscription: {
        create: {
          userId: session.user.id,
          status: "INACTIVE",
        },
      },
    },
  });

  redirect("/dashboard/owner");
}

export async function updateStoreBrandingAction(formData: FormData) {
  const session = await requireRole(Role.STORE_OWNER);

  const store = await prisma.store.findFirst({
    where: {
      ownerId: session.user.id,
    },
  });

  if (!store) {
    throw new Error("Store not found");
  }

  const parsed = storeBrandingSchema.safeParse({
    name: formData.get("name") || store.name,
    location: formData.get("location") || undefined,
    websiteUrl: formData.get("websiteUrl") || "",
  });

  if (!parsed.success) {
    throw new Error("Invalid store data");
  }

  const logoUrl = await saveStoreImage(formData.get("logo"));
  const bannerUrl = await saveStoreImage(formData.get("banner"));
  const locationImageUrl = await saveStoreImage(formData.get("locationImage"));

  await prisma.store.update({
    where: {
      id: store.id,
    },
    data: {
      name: parsed.data.name,
      location: parsed.data.location || null,
      websiteUrl: parsed.data.websiteUrl || null,
      logoUrl: logoUrl ?? store.logoUrl,
      bannerUrl: bannerUrl ?? store.bannerUrl,
      locationImageUrl: locationImageUrl ?? store.locationImageUrl,
    },
  });

  revalidatePath("/");
  revalidatePath("/stores");
  revalidatePath("/dashboard/owner");
  revalidatePath(`/stores/${store.slug}`);

  redirect("/dashboard/owner");
}
