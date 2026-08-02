import type { Currency } from "@/generated/prisma/enums";

export const USD_TO_ETB = Number(process.env.NEXT_PUBLIC_USD_TO_ETB ?? 165);

/**
 * Prices are never rounded into a single currency for display. A villa
 * advertised at $4,200 is aimed at a different buyer than one advertised at
 * 690,000 birr, and flattening the two loses that signal. The converted figure
 * is offered alongside, never instead.
 */
export function formatPrice(
  amount: number,
  currency: Currency,
  locale: string,
): string {
  const formatted = new Intl.NumberFormat(locale === "am" ? "am-ET" : "en-US", {
    maximumFractionDigits: 0,
  }).format(amount);
  return currency === "USD" ? `$${formatted}` : `${formatted} ETB`;
}

export function convertedPrice(
  amount: number,
  currency: Currency,
  locale: string,
): string {
  const converted =
    currency === "USD" ? amount * USD_TO_ETB : amount / USD_TO_ETB;
  const target: Currency = currency === "USD" ? "ETB" : "USD";
  const rounded =
    target === "ETB" ? Math.round(converted / 1000) * 1000 : Math.round(converted);
  return formatPrice(rounded, target, locale);
}

/** Compact form for map pins, where a full price will not fit. */
export function compactPrice(amount: number, currency: Currency): string {
  const value = currency === "USD" ? amount * USD_TO_ETB : amount;
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `${millions >= 10 ? Math.round(millions) : millions.toFixed(1)}M`;
  }
  if (value >= 1_000) return `${Math.round(value / 1000)}k`;
  return String(Math.round(value));
}

/** Ethiopians describe buildings as ground plus N floors, never "two-storey". */
export function formatFloors(floorsGPlus: number): string {
  return `G+${floorsGPlus}`;
}

export function formatArea(areaSqm: number): string {
  return `${new Intl.NumberFormat("en-US").format(Math.round(areaSqm))} m²`;
}
