"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfileAction } from "@/app/actions/profile";
import type { UserProfile } from "@/lib/user/profile";

const LISTER_TYPES = ["OWNER", "BROKER", "AGENCY"] as const;

export function ProfileCard({ profile }: { profile: UserProfile }) {
  const t = useTranslations("dashboard");
  const tLister = useTranslations("listerType");
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email ?? "");
  const [listerType, setListerType] = useState(profile.listerType ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <section className="rounded-xl border border-stone-soft bg-surface p-5 sm:p-6">
      <h2 className="font-display text-lg font-semibold text-ink">
        {t("profileTitle")}
      </h2>
      <p className="mt-1 text-sm text-ink-soft">{t("profileLede")}</p>

      <form
        className="mt-5 grid gap-4 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          setMessage(null);
          setError(null);
          startTransition(async () => {
            const result = await updateProfileAction({
              name,
              email,
              listerType: listerType || null,
            });
            if (!result.ok) {
              setError(
                result.error === "emailTaken"
                  ? t("profileEmailTaken")
                  : result.error === "unauthenticated"
                    ? t("profileUnauthenticated")
                    : t("profileInvalid"),
              );
              return;
            }
            setMessage(t("profileSaved"));
          });
        }}
      >
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="profile-name">{t("profileName")}</Label>
          <Input
            id="profile-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-11"
            required
            minLength={2}
            maxLength={80}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="profile-phone">{t("profilePhone")}</Label>
          <Input
            id="profile-phone"
            value={profile.phone}
            className="h-11 bg-stone-wash"
            disabled
            readOnly
          />
          <p className="text-xs text-ink-soft">{t("profilePhoneHint")}</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="profile-email">{t("profileEmail")}</Label>
          <Input
            id="profile-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-11"
            placeholder={t("profileEmailPlaceholder")}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="profile-lister">{t("profileListerType")}</Label>
          <select
            id="profile-lister"
            className="h-11 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            value={listerType}
            onChange={(event) => setListerType(event.target.value)}
          >
            <option value="">{t("profileListerOptional")}</option>
            {LISTER_TYPES.map((value) => (
              <option key={value} value={value}>
                {tLister(value)}
              </option>
            ))}
          </select>
        </div>

        {error ? (
          <p className="sm:col-span-2 text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="sm:col-span-2 text-sm text-mint-deep" role="status">
            {message}
          </p>
        ) : null}

        <div className="sm:col-span-2">
          <Button
            type="submit"
            disabled={pending}
            className="bg-bete text-paper hover:bg-bete-soft"
          >
            {pending ? t("profileSaving") : t("profileSave")}
          </Button>
        </div>
      </form>
    </section>
  );
}
