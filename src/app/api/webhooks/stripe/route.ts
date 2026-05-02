import { NextResponse } from "next/server";
import Stripe from "stripe";

import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

type SubscriptionStatus =
  | "INACTIVE"
  | "INCOMPLETE"
  | "INCOMPLETE_EXPIRED"
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED"
  | "UNPAID"
  | "PAUSED";

function mapStripeStatus(status: string): SubscriptionStatus {
  switch (status) {
    case "active":
      return "ACTIVE";
    case "trialing":
      return "TRIALING";
    case "past_due":
      return "PAST_DUE";
    case "canceled":
      return "CANCELED";
    case "unpaid":
      return "UNPAID";
    case "incomplete":
      return "INCOMPLETE";
    case "incomplete_expired":
      return "INCOMPLETE_EXPIRED";
    case "paused":
      return "PAUSED";
    default:
      return "INACTIVE";
  }
}

function getCurrentPeriodEnd(subscription: Stripe.Subscription) {
  const subscriptionWithPeriod = subscription as Stripe.Subscription & {
    current_period_end?: number;
  };

  if (typeof subscriptionWithPeriod.current_period_end === "number") {
    return new Date(subscriptionWithPeriod.current_period_end * 1000);
  }

  return null;
}

async function syncSubscriptionFromStripe(
  subscription: Stripe.Subscription,
  fallbackMetadata?: Stripe.Metadata | null,
) {
  const storeId =
    subscription.metadata.storeId || fallbackMetadata?.storeId || null;

  const userId =
    subscription.metadata.userId || fallbackMetadata?.userId || null;

  if (!storeId || !userId) {
    console.log("Missing storeId or userId in subscription metadata", {
      subscriptionMetadata: subscription.metadata,
      fallbackMetadata,
    });
    return;
  }

  const status = mapStripeStatus(subscription.status);

  const isActive = status === "ACTIVE" || status === "TRIALING";

  const stripeCustomerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const stripePriceId = subscription.items.data[0]?.price.id ?? null;

  const currentPeriodEnd = getCurrentPeriodEnd(subscription);

  await prisma.subscription.upsert({
    where: {
      storeId,
    },
    update: {
      status,
      stripeCustomerId,
      stripeSubscriptionId: subscription.id,
      stripePriceId,
      currentPeriodEnd,
    },
    create: {
      userId,
      storeId,
      status,
      stripeCustomerId,
      stripeSubscriptionId: subscription.id,
      stripePriceId,
      currentPeriodEnd,
    },
  });

  await prisma.store.update({
    where: {
      id: storeId,
    },
    data: {
      isPublished: isActive,
    },
  });

  console.log("Subscription synced successfully", {
    storeId,
    userId,
    status,
    isPublished: isActive,
  });
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Missing STRIPE_WEBHOOK_SECRET" },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 },
    );
  }

  const body = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid webhook signature";

    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;

        if (typeof checkoutSession.subscription === "string") {
          const subscription = await stripe.subscriptions.retrieve(
            checkoutSession.subscription,
          );

          await syncSubscriptionFromStripe(
            subscription,
            checkoutSession.metadata,
          );
        }

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        await syncSubscriptionFromStripe(subscription);

        break;
      }

      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook handler failed:", error);

    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}
