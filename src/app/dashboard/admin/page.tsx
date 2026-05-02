import { Role } from "@prisma/client";

import { updateStoreHomepageSettingsAction } from "@/actions/admin";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guards";

export default async function AdminDashboardPage() {
  await requireRole(Role.ADMIN);

  const [usersCount, storesCount, productsCount, subscriptions, stores] =
    await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.product.count(),

      prisma.subscription.findMany({
        include: {
          user: true,
          store: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
      }),

      prisma.store.findMany({
        include: {
          owner: true,
          subscription: true,
          _count: {
            select: {
              products: true,
            },
          },
        },
        orderBy: [
          {
            isFeatured: "desc",
          },
          {
            homeSort: "asc",
          },
          {
            createdAt: "desc",
          },
        ],
      }),
    ]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="mb-8 text-3xl font-bold">لوحة تحكم الأدمن</h1>

      <section className="mb-10 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border p-6">
          <p className="text-sm text-gray-500">المستخدمون</p>
          <p className="text-3xl font-bold">{usersCount}</p>
        </div>

        <div className="rounded-2xl border p-6">
          <p className="text-sm text-gray-500">المتاجر</p>
          <p className="text-3xl font-bold">{storesCount}</p>
        </div>

        <div className="rounded-2xl border p-6">
          <p className="text-sm text-gray-500">المنتجات</p>
          <p className="text-3xl font-bold">{productsCount}</p>
        </div>
      </section>

      <section className="mb-10">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">إدارة متاجر الصفحة الرئيسية</h2>
          <p className="mt-1 text-sm text-gray-500">
            من هنا تختار المتجر المميز وتحدد المتاجر التي تظهر في الصفحة
            الرئيسية وترتيبها.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border bg-white">
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4">المتجر</th>
                <th className="p-4">المالك</th>
                <th className="p-4">المنتجات</th>
                <th className="p-4">الاشتراك</th>
                <th className="p-4">متجر مميز</th>
                <th className="p-4">يظهر بالرئيسية</th>
                <th className="p-4">الترتيب</th>
                <th className="p-4">حفظ</th>
              </tr>
            </thead>

            <tbody>
              {stores.map((store) => (
                <tr key={store.id} className="border-t align-middle">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-black font-bold text-white">
                        {store.logoUrl ? (
                          <img
                            src={store.logoUrl}
                            alt={store.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          store.name.charAt(0).toUpperCase()
                        )}
                      </div>

                      <div>
                        <p className="font-semibold">{store.name}</p>
                        <p className="text-xs text-gray-500">
                          /stores/{store.slug}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">{store.owner.email}</td>

                  <td className="p-4">{store._count.products}</td>

                  <td className="p-4">
                    {store.subscription?.status || "INACTIVE"}
                  </td>

                  <td className="p-4">
                    <form
                      id={`store-home-settings-${store.id}`}
                      action={updateStoreHomepageSettingsAction.bind(
                        null,
                        store.id,
                      )}
                    >
                      <label className="inline-flex items-center gap-2">
                        <input
                          name="isFeatured"
                          type="checkbox"
                          defaultChecked={store.isFeatured}
                          className="h-4 w-4"
                        />
                        <span>مميز</span>
                      </label>
                    </form>
                  </td>

                  <td className="p-4">
                    <label className="inline-flex items-center gap-2">
                      <input
                        form={`store-home-settings-${store.id}`}
                        name="showOnHome"
                        type="checkbox"
                        defaultChecked={store.showOnHome}
                        className="h-4 w-4"
                      />
                      <span>نعم</span>
                    </label>
                  </td>

                  <td className="p-4">
                    <input
                      form={`store-home-settings-${store.id}`}
                      name="homeSort"
                      type="number"
                      defaultValue={store.homeSort}
                      className="w-24 rounded-lg border px-3 py-2"
                    />
                  </td>

                  <td className="p-4">
                    <button
                      form={`store-home-settings-${store.id}`}
                      className="rounded-lg bg-black px-4 py-2 font-medium text-white"
                    >
                      حفظ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-sm text-gray-500">
          ملاحظة: إذا اخترت متجرًا كمميز، سيتم إلغاء التمييز عن باقي المتاجر
          تلقائيًا.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">آخر الاشتراكات</h2>

        <div className="overflow-hidden rounded-2xl border bg-white">
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4">المتجر</th>
                <th className="p-4">المالك</th>
                <th className="p-4">الحالة</th>
                <th className="p-4">نهاية الفترة</th>
              </tr>
            </thead>

            <tbody>
              {subscriptions.map((subscription) => (
                <tr key={subscription.id} className="border-t">
                  <td className="p-4">{subscription.store.name}</td>
                  <td className="p-4">{subscription.user.email}</td>
                  <td className="p-4">{subscription.status}</td>
                  <td className="p-4">
                    {subscription.currentPeriodEnd
                      ? subscription.currentPeriodEnd.toLocaleDateString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
