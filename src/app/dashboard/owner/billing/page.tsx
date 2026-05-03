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
  const isActive =
    subscriptionStatus === "ACTIVE" || subscriptionStatus === "TRIALING";

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

        {!store.isApproved && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900">
            متجرك قيد المراجعة من الإدارة. بعد الموافقة سيظهر لك زر الاشتراك
            الشهري وتقدر تفعّل المتجر.
          </div>
        )}

        {store.isApproved && !isActive && (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm leading-7 text-green-800">
            تمت الموافقة على متجرك. يمكنك الآن تفعيل الاشتراك الشهري.
          </div>
        )}

        {isActive && (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm leading-7 text-green-800">
            اشتراكك فعال، ومتجرك جاهز للظهور للزوار.
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {store.isApproved && !isActive && (
            <form action={createCheckoutSessionAction.bind(null, store.id)}>
              <button className="rounded-lg bg-black px-5 py-2 font-medium text-white">
                <T path="billing.subscribeMonthly" />
              </button>
            </form>
          )}

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
