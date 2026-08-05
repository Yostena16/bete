"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { blockUserAction, unblockUserAction } from "@/app/actions/admin";
import type { AdminUserRow } from "@/lib/listings/admin";

export function UserManageRow({ user }: { user: AdminUserRow }) {
  const t = useTranslations("admin");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isBlocked = Boolean(user.blockedAt);
  const canBlock = user.role !== "ADMIN" && !isBlocked;

  return (
    <article className="rounded-xl border border-stone-soft bg-surface p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-base font-semibold text-ink">
              {user.name}
            </h3>
            <span className="rounded-md bg-stone-wash px-1.5 py-0.5 text-xs font-medium text-ink">
              {t(`roles.${user.role}`)}
            </span>
            {user.listerType ? (
              <span className="text-xs text-ink-soft">
                {t(`listerTypes.${user.listerType}`)}
              </span>
            ) : null}
            {isBlocked ? (
              <span className="rounded-md bg-danger/10 px-1.5 py-0.5 text-xs font-medium text-danger">
                {t("blockedBadge")}
              </span>
            ) : null}
          </div>
          <p className="text-sm text-ink-soft">
            {user.phone}
            {user.email ? ` · ${user.email}` : null}
          </p>
          <p className="text-xs text-ink-soft">
            {t("userListingCount", { count: user._count.listings })}
          </p>
          {user.blockReason ? (
            <p className="text-xs text-danger">{user.blockReason}</p>
          ) : null}
          <Link
            href={`/admin/listings?q=${encodeURIComponent(user.phone)}`}
            className="inline-block text-xs font-medium text-bete hover:underline"
          >
            {t("viewUserListings")}
          </Link>
        </div>

        <div className="w-full space-y-2 sm:max-w-sm">
          {canBlock ? (
            <>
              <label
                className="block text-xs font-medium text-ink"
                htmlFor={`block-${user.id}`}
              >
                {t("blockReason")}
              </label>
              <textarea
                id={`block-${user.id}`}
                rows={2}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder={t("blockPlaceholder")}
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
              />
              <Button
                type="button"
                variant="destructive"
                disabled={pending || reason.trim().length < 8}
                onClick={() =>
                  startTransition(async () => {
                    setError(null);
                    setMessage(null);
                    const result = await blockUserAction(user.id, reason);
                    if (!result.ok) {
                      setError(result.error ?? "failed");
                      return;
                    }
                    setMessage(
                      t("blockedToast", { count: result.takenDown ?? 0 }),
                    );
                    setReason("");
                  })
                }
              >
                {t("blockUser")}
              </Button>
            </>
          ) : null}

          {isBlocked ? (
            <Button
              type="button"
              disabled={pending}
              className="bg-mint-deep text-paper hover:bg-bete"
              onClick={() =>
                startTransition(async () => {
                  setError(null);
                  setMessage(null);
                  const result = await unblockUserAction(user.id);
                  if (!result.ok) {
                    setError(result.error ?? "failed");
                    return;
                  }
                  setMessage(t("unblockedToast"));
                })
              }
            >
              {t("unblockUser")}
            </Button>
          ) : null}

          {error ? (
            <p className="text-sm text-danger" role="alert">
              {[
                "forbidden",
                "notFound",
                "cannotBlockSelf",
                "cannotBlockAdmin",
                "alreadyBlocked",
                "notBlocked",
                "reasonShort",
                "failed",
              ].includes(error)
                ? t(`errors.${error}` as "errors.failed")
                : t("errors.failed")}
            </p>
          ) : null}
          {message ? (
            <p className="text-sm text-mint-deep" role="status">
              {message}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
