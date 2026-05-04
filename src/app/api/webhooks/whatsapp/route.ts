import { randomUUID } from "crypto";

import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

const VERIFY_TOKEN =
  process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "markethub_whatsapp_verify_123";

const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

const categoryMap: Record<string, string> = {
  SWEATERS: "SWEATERS",
  PANTS: "PANTS",
  SHOES: "SHOES",
  THOBES: "THOBES",
  SHIRTS: "SHIRTS",
  JACKETS: "JACKETS",
  DRESSES: "DRESSES",
  KIDS: "KIDS",
  ACCESSORIES: "ACCESSORIES",
  OTHER: "OTHER",
};

function normalizePhone(phone: string) {
  const cleaned = phone.replace(/[^\d+]/g, "");
  return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
}

function getField(text: string, keys: string[]) {
  const lines = text.split("\n");

  for (const line of lines) {
    const [rawKey, ...rest] = line.split(":");
    const key = rawKey?.trim().toLowerCase();
    const value = rest.join(":").trim();

    if (!key || !value) continue;

    if (keys.some((item) => key === item.toLowerCase())) {
      return value;
    }
  }

  return null;
}

function parseProductMessage(text: string) {
  const name = getField(text, ["اسم المنتج", "الاسم", "name", "product"]);
  const price = getField(text, ["السعر", "price"]);
  const currency = getField(text, ["العملة", "currency"]) || "TRY";
  const category = getField(text, ["التصنيف", "category"]) || "OTHER";
  const sizes = getField(text, ["المقاسات", "sizes"]);
  const colors = getField(text, ["الألوان", "الالوان", "colors"]);
  const description = getField(text, ["الوصف", "description"]);

  return {
    name,
    price: price ? Number(price.replace(",", ".")) : null,
    currency: currency.toLowerCase(),
    category: categoryMap[category.toUpperCase()] || "OTHER",
    sizes,
    colors,
    description,
  };
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

async function sendWhatsappMessage(
  phoneNumberId: string,
  to: string,
  message: string,
) {
  if (!WHATSAPP_ACCESS_TOKEN) return;

  await fetch(`https://graph.facebook.com/v25.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: {
        body: message,
      },
    }),
  });
}

async function downloadWhatsappImage(mediaId: string) {
  if (!WHATSAPP_ACCESS_TOKEN) return null;

  const mediaResponse = await fetch(
    `https://graph.facebook.com/v25.0/${mediaId}`,
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      },
    },
  );

  if (!mediaResponse.ok) return null;

  const mediaData = await mediaResponse.json();
  const mediaUrl = mediaData.url;

  if (!mediaUrl) return null;

  const imageResponse = await fetch(mediaUrl, {
    headers: {
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
    },
  });

  if (!imageResponse.ok) return null;

  const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
  const arrayBuffer = await imageResponse.arrayBuffer();

  const extension = contentType.includes("png")
    ? "png"
    : contentType.includes("webp")
      ? "webp"
      : "jpg";

  const fileName = `products/whatsapp-${randomUUID()}.${extension}`;

  const blob = await put(fileName, Buffer.from(arrayBuffer), {
    access: "public",
    contentType,
  });

  return blob.url;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);

  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Verification failed", { status: 403 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  console.log("📩 WhatsApp Webhook:", JSON.stringify(body, null, 2));

  const value = body?.entry?.[0]?.changes?.[0]?.value;
  const message = value?.messages?.[0];

  if (!message) {
    return NextResponse.json({ status: "ok" });
  }

  const phoneNumberId = value?.metadata?.phone_number_id;
  const senderPhone = normalizePhone(message.from);

  const store = await prisma.store.findFirst({
    where: {
      whatsappPhone: senderPhone,
    },
  });

  if (!store) {
    await sendWhatsappMessage(
      phoneNumberId,
      message.from,
      "رقمك غير مربوط بأي متجر في MarketHub. افتح لوحة صاحب المتجر واحفظ رقم واتسابك أولًا.",
    );

    return NextResponse.json({ status: "no-store" });
  }

  const text =
    message.type === "image"
      ? message.image?.caption || ""
      : message.text?.body || "";

  const productData = parseProductMessage(text);

  if (!productData.name || !productData.price || productData.price <= 0) {
    await sendWhatsappMessage(
      phoneNumberId,
      message.from,
      `أرسل المنتج بهذه الصيغة:

اسم المنتج: كنزة صوف
السعر: 200
العملة: TRY
التصنيف: SWEATERS
المقاسات: M, L, XL
الألوان: Black, Red
الوصف: كنزة شتوية

ويمكنك إرفاق صورة مع نفس النص.`,
    );

    return NextResponse.json({ status: "invalid-format" });
  }

  const imageUrl =
    message.type === "image" && message.image?.id
      ? await downloadWhatsappImage(message.image.id)
      : null;

  const slug = await createUniqueProductSlug(store.id, productData.name);

  const product = await prisma.product.create({
    data: {
      storeId: store.id,
      name: productData.name,
      slug,
      description: productData.description,
      category: productData.category as any,
      sizes: productData.sizes,
      colors: productData.colors,
      imageUrl,
      priceCents: Math.round(productData.price * 100),
      currency: productData.currency,
      isAvailable: true,
      isActive: true,
    },
  });

  revalidatePath("/");
  revalidatePath("/dashboard/owner");
  revalidatePath(`/stores/${encodeURIComponent(store.slug)}`);
  revalidatePath(`/products/${encodeURIComponent(product.slug)}`);
  revalidatePath(`/categories/${product.category.toLowerCase()}`);

  await sendWhatsappMessage(
    phoneNumberId,
    message.from,
    `تمت إضافة المنتج بنجاح ✅

${product.name}
السعر: ${productData.price} ${productData.currency.toUpperCase()}`,
  );

  return NextResponse.json({ status: "created", productId: product.id });
}
