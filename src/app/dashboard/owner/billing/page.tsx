import { Role } from "@prisma/client";

import {
  createCheckoutSessionAction,
  createCustomerPortalAction,
} from "@/actions/billing";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guards";
import { T } from "@/components/translated-text";

export default async function BillingPage() {
  const session = await requireRole(Role.STORE_OWNER);

  const store = await prisma.store.findFirst({
    where: {
      ownerId: session.user.id,
    },
    include: {
      subscription: true,
    },
  });

  if (!store) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-3xl font-bold">
          <T path="billing.title" />
        </h1>

        <p className="mt-4 text-gray-600">
          <T path="billing.createStoreFirst" />
        </p>
      </main>
    );
  }

  const hasStripeCustomer = Boolean(store.subscription?.stripeCustomerId);
  const subscriptionStatus = store.subscription?.status || "INACTIVE";

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-8 text-3xl font-bold">
        <T path="billing.title" />
      </h1>

      <div className="rounded-2xl border p-6">
        <p className="text-sm text-gray-500">
          <T path="billing.currentPlan" />
        </p>

        <h2 className="mt-1 text-2xl font-semibold">
          <T path="billing.monthlyPlan" />
        </h2>

        <p className="mt-4">
          <T path="billing.status" />:{" "}
          <span className="font-semibold">
            <T path={`statuses.${subscriptionStatus}`} />
          </span>
        </p>

        <p className="mt-2 text-sm text-gray-600">
          <T path="billing.publicWhenActive" />
        </p>

        <div className="mt-6 flex gap-3">
          <form action={createCheckoutSessionAction.bind(null, store.id)}>
            <button className="rounded-lg bg-black px-5 py-2 font-medium text-white">
              <T path="billing.subscribeMonthly" />
            </button>
          </form>

          {hasStripeCustomer && (
            <form action={createCustomerPortalAction.bind(null, store.id)}>
              <button className="rounded-lg border px-5 py-2 font-medium">
                <T path="billing.manageBilling" />
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
