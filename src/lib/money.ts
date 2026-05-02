export function formatMoney(priceCents: number, currency = "usd") {
  const normalizedCurrency =
    currency.toLowerCase() === "tl" ? "TRY" : currency.toUpperCase();

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: normalizedCurrency,
    }).format(priceCents / 100);
  } catch {
    return `${(priceCents / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}
