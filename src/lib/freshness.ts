/**
 * The freshness system, in one file.
 *
 * The problem this solves: every property site in Addis is full of listings
 * that were rented months ago. Nobody has an incentive to take them down, so
 * seekers burn airtime calling numbers about houses that are long gone.
 *
 * Every listing therefore has a thirty-day life. `lastConfirmedAt` resets it.
 * The cron job nags at day 21 and expires at day 30. The UI, the cron job and
 * the search ranking all read their rules from here so they cannot drift apart.
 */

export const LISTING_LIFESPAN_DAYS = 30;
/** Confirmed within this many days counts as fresh. */
export const FRESH_THROUGH_DAY = 7;
/** Confirmed within this many days counts as ageing. Beyond it, stale. */
export const AGEING_THROUGH_DAY = 21;
/** The day the "is this still available?" email goes out. */
export const REMINDER_DAY = 21;

export const MS_PER_DAY = 86_400_000;

export type FreshnessBand = "fresh" | "ageing" | "stale" | "expired";

export type Freshness = {
  band: FreshnessBand;
  /** Whole days since the lister last confirmed availability. */
  days: number;
  /** Whole weeks, rounded, for the ageing copy. */
  weeks: number;
  /** 0-1, the share of the thirty-day life still remaining. Drives the life rail. */
  lifeRemaining: number;
};

export function daysSince(date: Date | string, now: Date = new Date()): number {
  const then = typeof date === "string" ? new Date(date) : date;
  return Math.max(0, Math.floor((now.getTime() - then.getTime()) / MS_PER_DAY));
}

export function bandForDays(days: number): FreshnessBand {
  if (days <= FRESH_THROUGH_DAY) return "fresh";
  if (days <= AGEING_THROUGH_DAY) return "ageing";
  if (days <= LISTING_LIFESPAN_DAYS) return "stale";
  return "expired";
}

export function getFreshness(
  lastConfirmedAt: Date | string,
  now: Date = new Date(),
): Freshness {
  const days = daysSince(lastConfirmedAt, now);
  return {
    band: bandForDays(days),
    days,
    weeks: Math.max(1, Math.round(days / 7)),
    lifeRemaining: Math.max(0, Math.min(1, 1 - days / LISTING_LIFESPAN_DAYS)),
  };
}

/**
 * Default search ordering. The brief is explicit that results must not sort by
 * price by default, because price-sorted results are exactly how dead cheap
 * listings end up at the top of every competing site.
 *
 * Freshness carries most of the weight; recency of posting breaks ties so a
 * brand-new listing is not buried under an older one confirmed on the same day.
 */
export function blendedScore(
  lastConfirmedAt: Date | string,
  createdAt: Date | string,
  now: Date = new Date(),
): number {
  const confirmAge = daysSince(lastConfirmedAt, now);
  const postAge = daysSince(createdAt, now);
  const freshnessScore = Math.max(0, 1 - confirmAge / LISTING_LIFESPAN_DAYS);
  const recencyScore = Math.max(0, 1 - postAge / 90);
  return freshnessScore * 0.75 + recencyScore * 0.25;
}

export function expiryDateFrom(createdAt: Date): Date {
  return new Date(createdAt.getTime() + LISTING_LIFESPAN_DAYS * MS_PER_DAY);
}
