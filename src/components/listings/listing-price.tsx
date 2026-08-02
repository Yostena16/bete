import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { convertedPrice, formatPrice } from "@/lib/format";
import type { Currency, ListingType, RentPeriod } from "@/generated/prisma/enums";

type ListingPriceProps = {
  price: number;
  currency: Currency;
  listingType: ListingType;
  rentPeriod: RentPeriod | null;
  negotiable: boolean;
  locale: string;
  size?: "card" | "detail";
  className?: string;
};

/**
 * Rent is quoted per period and sale is quoted flat, so the period suffix is
 * driven by the listing type rather than by whether rentPeriod happens to be
 * set. The second currency sits underneath at a smaller size: useful to the
 * diaspora buyer, never competing with the advertised figure.
 */
export function ListingPrice({
  price,
  currency,
  listingType,
  rentPeriod,
  negotiable,
  locale,
  size = "card",
  className,
}: ListingPriceProps) {
  const t = useTranslations();
  const suffix =
    listingType === "FOR_RENT"
      ? rentPeriod === "ANNUAL"
        ? t("common.perYear")
        : t("common.perMonth")
      : null;

  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2", className)}>
      <p
        className={cn(
          "font-display font-semibold tracking-tight text-ink",
          size === "card" ? "text-lg" : "text-3xl",
        )}
      >
        {formatPrice(price, currency, locale)}
        {suffix ? (
          <span className="font-body text-sm font-normal text-ink-soft">
            {suffix}
          </span>
        ) : null}
      </p>
      <p className="text-xs text-ink-soft">
        {t("listing.approx", { price: convertedPrice(price, currency, locale) })}
      </p>
      {negotiable ? (
        <span className="text-xs font-medium text-ochre-deep">
          {t("common.negotiable")}
        </span>
      ) : null}
    </div>
  );
}
