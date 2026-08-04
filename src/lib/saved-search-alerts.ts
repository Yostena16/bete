import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { countListingsCreatedSince } from "@/lib/listings/query";
import {
  filtersFromSavedSearch,
  isAlertDue,
  parseSavedSearchQuery,
  savedSearchHref,
} from "@/lib/listings/saved-search";

export type SavedSearchAlertResult = {
  checked: number;
  sent: number;
  skippedNoEmail: number;
  skippedNoMatches: number;
};

function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function alertCopy(input: {
  name: string;
  searchName: string;
  count: number;
  searchUrl: string;
}) {
  const subject =
    input.count === 1
      ? `1 new home for “${input.searchName}”`
      : `${input.count} new homes for “${input.searchName}”`;

  const text = [
    `Hi ${input.name},`,
    "",
    `${input.count === 1 ? "1 new listing matches" : `${input.count} new listings match`} your saved search “${input.searchName}”.`,
    "",
    `Open the search: ${input.searchUrl}`,
    "",
    "— Bete",
  ].join("\n");

  const html = `
    <p>Hi ${escapeHtml(input.name)},</p>
    <p>${input.count === 1 ? "1 new listing matches" : `${input.count} new listings match`}
    your saved search <strong>${escapeHtml(input.searchName)}</strong>.</p>
    <p><a href="${input.searchUrl}">Open the search</a></p>
    <p>— Bete</p>
  `;

  return { subject, text, html };
}

/**
 * Daily alert sweep for saved searches. INSTANT searches fire whenever this
 * runs and there are new matches; DAILY/WEEKLY wait for their interval.
 */
export async function runSavedSearchAlerts(
  now: Date = new Date(),
): Promise<SavedSearchAlertResult> {
  const rows = await prisma.savedSearch.findMany({
    select: {
      id: true,
      name: true,
      frequency: true,
      lastSentAt: true,
      createdAt: true,
      queryJson: true,
      user: { select: { name: true, email: true } },
    },
    take: 500,
  });

  let sent = 0;
  let skippedNoEmail = 0;
  let skippedNoMatches = 0;
  const base = siteUrl();

  for (const row of rows) {
    if (!isAlertDue(row.frequency, row.lastSentAt, row.createdAt, now)) {
      continue;
    }

    const query = parseSavedSearchQuery(row.queryJson);
    if (!query) continue;

    const since = row.lastSentAt ?? row.createdAt;
    const count = await countListingsCreatedSince(
      filtersFromSavedSearch(query),
      query.listingType,
      since,
    );

    if (count === 0) {
      skippedNoMatches += 1;
      // Still advance lastSentAt for DAILY/WEEKLY so we do not re-check every
      // minute once cron is more frequent; INSTANT stays quiet until new stock.
      if (row.frequency !== "INSTANT") {
        await prisma.savedSearch.update({
          where: { id: row.id },
          data: { lastSentAt: now },
        });
      }
      continue;
    }

    const to = row.user.email;
    if (!to) {
      skippedNoEmail += 1;
      await prisma.savedSearch.update({
        where: { id: row.id },
        data: { lastSentAt: now },
      });
      continue;
    }

    const href = savedSearchHref(query);
    const searchUrl = `${base}/en${href}`;
    const copy = alertCopy({
      name: row.user.name,
      searchName: row.name,
      count,
      searchUrl,
    });
    await sendEmail({ to, ...copy });
    await prisma.savedSearch.update({
      where: { id: row.id },
      data: { lastSentAt: now },
    });
    sent += 1;
  }

  return {
    checked: rows.length,
    sent,
    skippedNoEmail,
    skippedNoMatches,
  };
}
