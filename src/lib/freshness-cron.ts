import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import {
  LISTING_LIFESPAN_DAYS,
  MS_PER_DAY,
  REMINDER_DAY,
} from "@/lib/freshness";

export type FreshnessCronResult = {
  reminded: number;
  expired: number;
  skippedNoContact: number;
};

function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}

function reminderCopy(input: {
  name: string;
  title: string;
  reference: string;
  stillUrl: string;
  takenUrl: string;
}) {
  const subject = `Is ${input.reference} still available?`;
  const text = [
    `Hi ${input.name},`,
    "",
    `Your listing "${input.title}" (${input.reference}) is three weeks old.`,
    "If it is still free, confirm it in one tap so seekers keep seeing it.",
    "",
    `Still available: ${input.stillUrl}`,
    `Already taken: ${input.takenUrl}`,
    "",
    "If nobody confirms within thirty days, Bete removes it from search.",
    "— Bete",
  ].join("\n");

  const html = `
    <p>Hi ${escapeHtml(input.name)},</p>
    <p>Your listing <strong>${escapeHtml(input.title)}</strong>
    (<code>${escapeHtml(input.reference)}</code>) is three weeks old.</p>
    <p>If it is still free, confirm it so seekers keep seeing it.</p>
    <p>
      <a href="${input.stillUrl}">Still available</a>
      &nbsp;·&nbsp;
      <a href="${input.takenUrl}">Already taken</a>
    </p>
    <p>If nobody confirms within thirty days, Bete removes it from search.</p>
    <p>— Bete</p>
  `;

  return { subject, text, html };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/**
 * Daily freshness sweep.
 *
 * Day 21: email the lister once (guarded by reminderSentAt).
 * Day 30+: expire ACTIVE listings so they leave search.
 */
export async function runFreshnessCron(
  now: Date = new Date(),
): Promise<FreshnessCronResult> {
  const reminderBefore = new Date(
    now.getTime() - REMINDER_DAY * MS_PER_DAY,
  );
  const expireBefore = new Date(
    now.getTime() - LISTING_LIFESPAN_DAYS * MS_PER_DAY,
  );

  const dueForReminder = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      reminderSentAt: null,
      lastConfirmedAt: { lte: reminderBefore },
    },
    select: {
      id: true,
      reference: true,
      titleEn: true,
      confirmToken: true,
      user: { select: { name: true, email: true, phone: true } },
    },
    take: 200,
  });

  let reminded = 0;
  let skippedNoContact = 0;
  const base = siteUrl();

  for (const listing of dueForReminder) {
    const to = listing.user.email;
    const stillUrl = `${base}/en/confirm/${listing.confirmToken}?action=available`;
    const takenUrl = `${base}/en/confirm/${listing.confirmToken}?action=taken`;

    if (!to) {
      // No inbox — still mark reminded so we do not retry forever. The
      // dashboard confirm button remains the reliable path for phone-only users.
      skippedNoContact += 1;
    } else {
      const copy = reminderCopy({
        name: listing.user.name,
        title: listing.titleEn,
        reference: listing.reference,
        stillUrl,
        takenUrl,
      });
      await sendEmail({ to, ...copy });
      reminded += 1;
    }

    await prisma.listing.update({
      where: { id: listing.id },
      data: { reminderSentAt: now },
    });
  }

  const expiredResult = await prisma.listing.updateMany({
    where: {
      status: "ACTIVE",
      lastConfirmedAt: { lte: expireBefore },
    },
    data: { status: "EXPIRED" },
  });

  return {
    reminded,
    expired: expiredResult.count,
    skippedNoContact,
  };
}
