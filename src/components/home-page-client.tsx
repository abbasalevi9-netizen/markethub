"use client";

import Image from "next/image";
import Link from "next/link";

import { useLanguage } from "@/components/language-provider";

type HomeStore = {
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
  productsCount: number;
};

type HomeProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  priceCents: number;
  currency: string;
  isAvailable: boolean;
  sizes: string | null;
  colors: string | null;
  store: {
    name: string;
    slug: string;
    logoUrl: string | null;
  };
};

type HomePageClientProps = {
  stores: HomeStore[];
  featuredStore: HomeStore | null;
  locationStores: HomeStore[];
  products: HomeProduct[];
};

const colorMap: Record<string, string> = {
  Black: "#000000",
  White: "#ffffff",
  Red: "#ef4444",
  Blue: "#3b82f6",
  Green: "#22c55e",
  Yellow: "#eab308",
  Gray: "#6b7280",
};

function formatPrice(priceCents: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(priceCents / 100);
  } catch {
    return `${(priceCents / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}

function getSizesList(sizes: string | null) {
  return sizes
    ? sizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 3)
    : [];
}

function getColorsList(colors: string | null) {
  return colors
    ? colors
        .split(",")
        .map((color) => color.trim())
        .filter(Boolean)
        .slice(0, 4)
    : [];
}

export function HomePageClient({
  stores,
  featuredStore,
  locationStores,
  products,
}: HomePageClientProps) {
  const { language } = useLanguage();

  const text =
    language === "ar"
      ? {
          badge: "منصة متاجر الأزياء",
          title: "أنشئ واستضف عدة متاجر داخل سوق واحد",
          description: "منصة متكاملة لإطلاق وإدارة متاجرك بسهولة واحترافية.",
          browseStores: "تصفح المتاجر",
          startStore: "ابدأ متجرك الآن",
          featuredStore: "المتجر المميز",
          featuredBadge: "متجر مميز",
          stores: "المتاجر",
          storesSubtitle: "تصفح المتاجر المميزة",
          visitStore: "زيارة المتجر",
          allStores: "عرض جميع المتاجر",
          websites: "المواقع",
          websitesSubtitle: "اكتشف مواقع المتاجر",
          allWebsites: "عرض جميع المواقع",
          noStores: "لا توجد متاجر بعد.",
          noWebsites: "لا توجد مواقع مضافة بعد.",
          productsTitle: "منتجات مختارة من متاجر مختلفة",
          productsSubtitle: "اكتشف مجموعة من الألبسة والمنتجات من عدة متاجر.",
          noProducts: "لا توجد منتجات لعرضها حاليًا.",
          viewProduct: "عرض المنتج",
          available: "متوفر",
          unavailable: "غير متوفر",
          fallbackDescription: "متجر أزياء داخل منصة MarketHub.",
          support: "دعم على مدار الساعة",
          supportDesc: "فريق دعم جاهز لخدمتك",
          safe: "تسوق آمن",
          safeDesc: "حماية بياناتك وعملياتك",
          fast: "شحن سريع",
          fastDesc: "خدمات موثوقة وسريعة",
          offers: "عروض حصرية",
          offersDesc: "خصومات وعروض مميزة",
          quality: "جودة مضمونة",
          qualityDesc: "منتجات من متاجر موثوقة",
        }
      : language === "tr"
        ? {
            badge: "Moda mağazaları platformu",
            title: "Tek pazaryerinde birden fazla mağaza oluştur",
            description:
              "Mağazalarını kolay ve profesyonel şekilde yönetmek için modern bir platform.",
            browseStores: "Mağazaları görüntüle",
            startStore: "Mağazanı başlat",
            featuredStore: "Öne çıkan mağaza",
            featuredBadge: "Öne çıkan",
            stores: "Mağazalar",
            storesSubtitle: "Öne çıkan mağazaları keşfet",
            visitStore: "Mağazayı ziyaret et",
            allStores: "Tüm mağazalar",
            websites: "Web siteleri",
            websitesSubtitle: "Mağaza bağlantılarını keşfet",
            allWebsites: "Tüm siteler",
            noStores: "Henüz mağaza yok.",
            noWebsites: "Henüz site eklenmedi.",
            productsTitle: "Farklı mağazalardan seçili ürünler",
            productsSubtitle: "Birden fazla mağazadan ürünleri keşfet.",
            noProducts: "Henüz gösterilecek ürün yok.",
            viewProduct: "Ürünü görüntüle",
            available: "Mevcut",
            unavailable: "Yok",
            fallbackDescription: "MarketHub içinde bir moda mağazası.",
            support: "7/24 destek",
            supportDesc: "Ekibimiz hazır",
            safe: "Güvenli alışveriş",
            safeDesc: "Verileriniz korunur",
            fast: "Hızlı kargo",
            fastDesc: "Güvenilir hizmet",
            offers: "Özel fırsatlar",
            offersDesc: "Günlük indirimler",
            quality: "Garantili kalite",
            qualityDesc: "Güvenilir mağazalar",
          }
        : {
            badge: "Fashion marketplace platform",
            title: "Build and host multiple stores inside one marketplace",
            description:
              "A complete platform to launch and manage your stores professionally.",
            browseStores: "Browse stores",
            startStore: "Start your store",
            featuredStore: "Featured store",
            featuredBadge: "Featured",
            stores: "Stores",
            storesSubtitle: "Browse featured stores",
            visitStore: "Visit store",
            allStores: "View all stores",
            websites: "Websites",
            websitesSubtitle: "Explore store links",
            allWebsites: "View all websites",
            noStores: "No stores yet.",
            noWebsites: "No websites added yet.",
            productsTitle: "Selected products from different stores",
            productsSubtitle:
              "Discover clothing and products from many stores.",
            noProducts: "No products to show yet.",
            viewProduct: "View product",
            available: "Available",
            unavailable: "Unavailable",
            fallbackDescription: "A fashion store inside MarketHub.",
            support: "24/7 support",
            supportDesc: "Ready to help",
            safe: "Safe shopping",
            safeDesc: "Protected data",
            fast: "Fast shipping",
            fastDesc: "Reliable service",
            offers: "Exclusive offers",
            offersDesc: "Special discounts",
            quality: "Guaranteed quality",
            qualityDesc: "Trusted stores",
          };

  const heroImage = "/hero-store.png";

  return (
    <main className="w-full overflow-hidden bg-[#f7efe3]">
      <section className="relative min-h-[78vh] w-full overflow-hidden">
        <Image
          src={heroImage}
          alt="Fashion marketplace"
          fill
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1b1208]/80 via-black/30 to-black/35" />

        {featuredStore && (
          <div className="relative z-20 mx-auto flex max-w-7xl justify-center px-4 pt-8 md:px-6 lg:absolute lg:inset-y-0 lg:left-0 lg:right-0 lg:items-center lg:justify-start lg:pt-0">
            <Link
              href={`/stores/${featuredStore.slug}`}
              className="group w-full max-w-[230px] rounded-[1.5rem] border border-amber-300/80 bg-white/85 p-4 text-center text-stone-950 shadow-2xl shadow-black/25 backdrop-blur-md transition hover:-translate-y-1 hover:bg-white md:max-w-[260px] md:p-5"
            >
              <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-amber-300 px-4 py-2 text-xs font-extrabold text-black shadow-sm">
                <span>☆</span>
                {text.featuredBadge}
              </div>

              <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-black text-2xl font-bold text-white shadow-lg md:h-24 md:w-24">
                {featuredStore.logoUrl ? (
                  <Image
                    src={featuredStore.logoUrl}
                    alt={featuredStore.name}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  featuredStore.name.charAt(0).toUpperCase()
                )}
              </div>

              <h2 className="mt-4 line-clamp-1 text-xl font-extrabold md:text-2xl">
                {featuredStore.name}
              </h2>

              <p className="mx-auto mt-2 line-clamp-2 max-w-[190px] text-sm leading-6 text-stone-600">
                {featuredStore.description || text.fallbackDescription}
              </p>

              <div className="mt-5 rounded-xl bg-black px-5 py-3 text-sm font-extrabold text-white shadow-lg transition group-hover:bg-amber-900">
                {text.visitStore}
              </div>
            </Link>
          </div>
        )}

        <div className="relative z-10 flex min-h-[58vh] items-center justify-center px-6 py-12 text-center text-white md:min-h-[74vh] md:py-20">
          <div className="max-w-4xl">
            <p className="mb-5 inline-flex rounded-full border border-white/25 bg-white/10 px-5 py-2 text-sm font-semibold backdrop-blur">
              {text.badge}
            </p>

            <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">
              {text.title}
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/85">
              {text.description}
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/stores"
                className="rounded-xl bg-amber-300 px-7 py-3 font-bold text-black shadow-lg shadow-amber-900/20 transition hover:bg-amber-200"
              >
                {text.browseStores}
              </Link>

              <Link
                href="/register"
                className="rounded-xl border border-white/40 bg-white/10 px-7 py-3 font-bold text-white backdrop-blur transition hover:bg-white/20"
              >
                {text.startStore}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-20 px-4 py-10 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 text-center md:mb-8">
            <h2 className="text-2xl font-extrabold md:text-3xl">
              {text.productsTitle}
            </h2>

            <div className="mx-auto my-3 h-px w-32 bg-gradient-to-r from-transparent via-amber-500 to-transparent md:my-4 md:w-40" />

            <p className="text-sm text-stone-500">{text.productsSubtitle}</p>
          </div>

          {products.length === 0 ? (
            <div className="rounded-[2rem] border border-amber-200/70 bg-white/70 p-10 text-center text-stone-500 shadow-lg">
              {text.noProducts}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 lg:gap-3">
              {products.map((product) => {
                const sizes = getSizesList(product.sizes);
                const colors = getColorsList(product.colors);

                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="group block w-full overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="relative aspect-square bg-stone-100">
                      <Image
                        src={product.imageUrl || heroImage}
                        alt={product.name}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />

                      <span
                        className={`absolute start-1.5 top-1.5 rounded-full px-2 py-1 text-[10px] font-bold ${
                          product.isAvailable
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {product.isAvailable
                          ? text.available
                          : text.unavailable}
                      </span>

                      <div className="absolute bottom-1.5 end-1.5 flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-black text-[10px] font-bold text-white shadow-md">
                        {product.store.logoUrl ? (
                          <Image
                            src={product.store.logoUrl}
                            alt={product.store.name}
                            width={28}
                            height={28}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          product.store.name.charAt(0).toUpperCase()
                        )}
                      </div>
                    </div>

                    <div className="p-2 text-right">
                      <h3 className="line-clamp-1 text-xs font-extrabold text-stone-900">
                        {product.name}
                      </h3>

                      <p className="mt-1 line-clamp-1 text-[11px] text-stone-500">
                        {product.store.name}
                      </p>

                      {sizes.length > 0 && (
                        <div className="mt-1 flex flex-wrap justify-end gap-1">
                          {sizes.map((s) => (
                            <span
                              key={s}
                              className="rounded bg-stone-100 px-1.5 py-0.5 text-[9px] font-bold"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}

                      {colors.length > 0 && (
                        <div className="mt-1 flex flex-wrap justify-end gap-1">
                          {colors.map((color) => (
                            <span
                              key={color}
                              className="h-3 w-3 rounded-full border border-stone-300"
                              style={{
                                backgroundColor: colorMap[color] || "#d1d5db",
                              }}
                              title={color}
                            />
                          ))}
                        </div>
                      )}

                      <div className="mt-2 flex items-center justify-between gap-1">
                        <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-900">
                          {formatPrice(product.priceCents, product.currency)}
                        </span>

                        <span className="text-[10px] font-bold text-stone-700 group-hover:text-amber-700">
                          {text.viewProduct}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="relative z-10 px-6 pb-10">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(245,196,112,0.32),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.10),transparent_35%)]" />

        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[340px_1fr]">
          <aside className="relative order-4 overflow-hidden rounded-[2rem] border border-amber-200/70 bg-[linear-gradient(145deg,#fffaf1,#f8ecd9)] p-5 shadow-2xl shadow-amber-950/10 lg:order-1">
            <div className="pointer-events-none absolute -end-16 -top-16 h-44 w-44 rounded-full bg-amber-200/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -start-20 h-56 w-56 rounded-full bg-white/70 blur-3xl" />

            <div className="relative mb-5 flex items-center justify-center gap-2">
              <span className="text-2xl text-amber-600">◎</span>
              <div>
                <h2 className="text-center text-2xl font-extrabold">
                  {text.websites}
                </h2>
                <p className="mt-1 text-center text-sm text-stone-500">
                  {text.websitesSubtitle}
                </p>
              </div>
            </div>

            {locationStores.length === 0 ? (
              <div className="relative rounded-3xl border border-amber-200/70 bg-white/55 p-8 text-center shadow-inner">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl">
                  🌐
                </div>
                <p className="text-sm text-stone-600">{text.noWebsites}</p>
              </div>
            ) : (
              <div className="relative space-y-3">
                {locationStores.map((store) => {
                  const href = store.websiteUrl || `/stores/${store.slug}`;
                  const isExternal = Boolean(store.websiteUrl);

                  return (
                    <a
                      key={store.id}
                      href={href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noreferrer" : undefined}
                      className="group relative flex min-h-24 overflow-hidden rounded-2xl border border-white/60 bg-black text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-xl"
                    >
                      <Image
                        src={
                          store.locationImageUrl || store.bannerUrl || heroImage
                        }
                        alt={store.name}
                        fill
                        className="object-cover opacity-75 transition group-hover:scale-105"
                      />

                      <div className="absolute inset-0 bg-gradient-to-l from-black/75 via-black/35 to-black/10" />

                      <div className="relative z-10 flex w-full items-center justify-between gap-3 p-4">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-black transition group-hover:bg-amber-300">
                          ‹
                        </span>

                        <div className="min-w-0 text-right">
                          <h3 className="line-clamp-1 text-lg font-bold">
                            {store.name}
                          </h3>
                          <p className="line-clamp-1 text-sm text-white/75">
                            {store.location || store.websiteUrl}
                          </p>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}

            <Link
              href="/stores"
              className="relative mt-5 flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white/60 px-5 py-3 font-bold text-amber-900 transition hover:bg-amber-300 hover:text-black"
            >
              <span>⌖</span>
              {text.allWebsites}
            </Link>
          </aside>

          <section className="relative order-3 overflow-hidden rounded-[2rem] border border-amber-200/70 bg-[linear-gradient(145deg,#fffdf7,#fbf1e1)] p-5 shadow-2xl shadow-amber-950/10 lg:order-2">
            <div className="pointer-events-none absolute -top-20 start-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-amber-200/20 blur-3xl" />

            <div className="relative mb-6 flex items-start justify-between gap-3">
              <Link
                href="/stores"
                className="rounded-full px-3 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
              >
                ‹ {text.allStores}
              </Link>

              <div className="text-right">
                <h2 className="flex items-center justify-end gap-2 text-3xl font-extrabold">
                  {text.stores}
                  <span className="text-amber-600">🏬</span>
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  {text.storesSubtitle}
                </p>
              </div>
            </div>

            {stores.length === 0 ? (
              <div className="relative rounded-3xl border border-amber-200/70 bg-white/55 p-10 text-center text-stone-500 shadow-inner">
                {text.noStores}
              </div>
            ) : (
              <div className="relative grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {stores.map((store) => (
                  <Link
                    key={store.id}
                    href={`/stores/${store.slug}`}
                    className="group overflow-hidden rounded-3xl border border-amber-100 bg-white shadow-lg shadow-amber-950/5 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-950/10"
                  >
                    <div className="relative h-36 bg-stone-100">
                      <Image
                        src={store.bannerUrl || heroImage}
                        alt={store.name}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                    </div>

                    <div className="-mt-12 px-4 pb-5 text-center">
                      <div className="relative z-10 mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-[6px] border-white bg-black text-2xl font-bold text-white shadow-xl">
                        {store.logoUrl ? (
                          <Image
                            src={store.logoUrl}
                            alt={store.name}
                            width={96}
                            height={96}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          store.name.charAt(0).toUpperCase()
                        )}
                      </div>

                      <h3 className="mt-3 line-clamp-1 text-lg font-extrabold">
                        {store.name}
                      </h3>

                      <p className="mt-1 line-clamp-1 text-sm text-stone-500">
                        {store.description || text.fallbackDescription}
                      </p>

                      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-900 transition group-hover:bg-black group-hover:text-white">
                        {text.visitStore}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <Link
              href="/stores"
              className="relative mx-auto mt-6 flex max-w-md items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white/70 px-5 py-3 font-bold text-amber-900 transition hover:bg-amber-300 hover:text-black"
            >
              {text.allStores}
              <span>🏬</span>
            </Link>
          </section>
        </div>
      </section>

      <section className="border-t border-amber-200/60 bg-[#fbf3e8] px-6 py-6">
        <div className="mx-auto grid max-w-7xl gap-4 text-center sm:grid-cols-2 lg:grid-cols-5">
          {[
            [text.support, text.supportDesc, "🎧"],
            [text.safe, text.safeDesc, "🛡️"],
            [text.fast, text.fastDesc, "🚚"],
            [text.offers, text.offersDesc, "🏷️"],
            [text.quality, text.qualityDesc, "🏅"],
          ].map(([title, description, icon]) => (
            <div
              key={title}
              className="rounded-2xl border border-amber-100 bg-white/70 p-4 shadow-sm"
            >
              <div className="mb-2 text-2xl">{icon}</div>
              <h3 className="font-bold">{title}</h3>
              <p className="mt-1 text-sm text-stone-500">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
