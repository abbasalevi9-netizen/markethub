"use server";

import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guards";

export async function updateStoreHomepageSettingsAction(
  storeId: string,
  formData: FormData,
) {
  await requireRole(Role.ADMIN);

  const isFeatured = formData.get("isFeatured") === "on";
  const showOnHome = formData.get("showOnHome") === "on";
  const homeSortValue = Number(formData.get("homeSort") || 0);

  const homeSort = Number.isFinite(homeSortValue) ? homeSortValue : 0;

  if (isFeatured) {
    await prisma.$transaction([
      prisma.store.updateMany({
        where: {
          isFeatured: true,
          NOT: {
            id: storeId,
          },
        },
        data: {
          isFeatured: false,
        },
      }),

      prisma.store.update({
        where: {
          id: storeId,
        },
        data: {
          isFeatured: true,
          showOnHome,
          homeSort,
        },
      }),
    ]);
  } else {
    await prisma.store.update({
      where: {
        id: storeId,
      },
      data: {
        isFeatured: false,
        showOnHome,
        homeSort,
      },
    });
  }

  revalidatePath("/");
  revalidatePath("/stores");
  revalidatePath("/dashboard/admin");
}

export async function approveStoreAction(storeId: string) {
  await requireRole(Role.ADMIN);

  await prisma.store.update({
    where: {
      id: storeId,
    },
    data: {
      isApproved: true,
    },
  });

  revalidatePath("/");
  revalidatePath("/stores");
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/owner");
  revalidatePath("/dashboard/owner/billing");
}

export async function unapproveStoreAction(storeId: string) {
  await requireRole(Role.ADMIN);

  await prisma.store.update({
    where: {
      id: storeId,
    },
    data: {
      isApproved: false,
      isPublished: false,
    },
  });

  revalidatePath("/");
  revalidatePath("/stores");
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/owner");
  revalidatePath("/dashboard/owner/billing");
}
