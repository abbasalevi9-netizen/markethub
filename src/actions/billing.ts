"use server";

import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guards";
import { stripe } from "@/lib/stripe";

export async function createCheckoutSessionAction(storeId: string) {
  const session = await requireRole(Role.STORE_OWNER);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const priceId = process.env.STRIPE_STORE_MONTHLY_PRICE_ID;

  if (!appUrl || !priceId) {
    throw new Error("Missing Stripe environment variables");
  }

  const store = await prisma.store.findFirst({
    where: {
      id: storeId,
      ownerId: session.user.id,
    },
    include: {
      subscription: true,
    },
  });

  if (!store) {
    throw new Error("Store not found");
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: store.subscription?.stripeCustomerId || undefined,
    customer_email: store.subscription?.stripeCustomerId
      ? undefined
      : session.user.email || undefined,

    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],

    success_url: `${appUrl}/dashboard/owner/billing?success=1`,
    cancel_url: `${appUrl}/dashboard/owner/billing?canceled=1`,

    metadata: {
      userId: session.user.id,
      storeId: store.id,
    },

    subscription_data: {
      metadata: {
        userId: session.user.id,
        storeId: store.id,
      },
    },
  });

  if (!checkoutSession.url) {
    throw new Error("Could not create Stripe Checkout session");
  }

  redirect(checkoutSession.url);
}

export async function createCustomerPortalAction(storeId: string) {
  const session = await requireRole(Role.STORE_OWNER);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    throw new Error("Missing NEXT_PUBLIC_APP_URL");
  }

  const store = await prisma.store.findFirst({
    where: {
      id: storeId,
      ownerId: session.user.id,
    },
    include: {
      subscription: true,
    },
  });

  if (!store?.subscription?.stripeCustomerId) {
    throw new Error("No Stripe customer found");
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: store.subscription.stripeCustomerId,
    return_url: `${appUrl}/dashboard/owner/billing`,
  });

  redirect(portalSession.url);
}
