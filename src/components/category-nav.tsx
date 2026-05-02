"use client";

import Link from "next/link";

import { useLanguage } from "@/components/language-provider";

export function CategoryNav() {
  const { language } = useLanguage();

  const labels =
    language === "ar"
      ? {
          all: "الكل",
          sweaters: "كنزات",
          pants: "بناطيل",
          shoes: "أحذية",
          thobes: "ثياب",
          shirts: "قمصان",
          jackets: "جاكيتات",
          dresses: "فساتين",
          kids: "أطفال",
          accessories: "إكسسوارات",
        }
      : language === "tr"
        ? {
            all: "Tümü",
            sweaters: "Kazaklar",
            pants: "Pantolonlar",
            shoes: "Ayakkabılar",
            thobes: "Thobes",
            shirts: "Gömlekler",
            jackets: "Ceketler",
            dresses: "Elbiseler",
            kids: "Çocuk",
            accessories: "Aksesuarlar",
          }
        : {
            all: "All",
            sweaters: "Sweaters",
            pants: "Pants",
            shoes: "Shoes",
            thobes: "Thobes",
            shirts: "Shirts",
            jackets: "Jackets",
            dresses: "Dresses",
            kids: "Kids",
            accessories: "Accessories",
          };

  const categoryLinks = [
    { href: "/", label: labels.all },
    { href: "/categories/sweaters", label: labels.sweaters },
    { href: "/categories/pants", label: labels.pants },
    { href: "/categories/shoes", label: labels.shoes },
    { href: "/categories/thobes", label: labels.thobes },
    { href: "/categories/shirts", label: labels.shirts },
    { href: "/categories/jackets", label: labels.jackets },
    { href: "/categories/dresses", label: labels.dresses },
    { href: "/categories/kids", label: labels.kids },
    { href: "/categories/accessories", label: labels.accessories },
  ];

  return (
    <div className="border-t border-black/5 bg-white/80">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div
          dir={language === "ar" ? "rtl" : "ltr"}
          className="flex gap-2 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {categoryLinks.map((category) => (
            <Link
              key={category.href}
              href={category.href}
              className="shrink-0 rounded-full border border-amber-200 bg-[#fff8e8] px-4 py-2 text-sm font-bold text-amber-950 shadow-sm transition hover:border-amber-300 hover:bg-amber-300 hover:text-black"
            >
              {category.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
