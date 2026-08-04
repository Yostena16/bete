"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { registerAction, type AuthActionState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: AuthActionState = { ok: false };

export function RegisterForm() {
  const t = useTranslations("auth");
  const tLister = useTranslations("listerType");
  const [intent, setIntent] = useState<"seeker" | "lister">("seeker");
  const [state, action, pending] = useActionState(registerAction, initial);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">{t("name")}</Label>
        <Input id="name" name="name" autoComplete="name" required minLength={2} className="h-11" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone">{t("phone")}</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="0911…"
          required
          className="h-11"
        />
        <p className="text-xs text-ink-soft">{t("phoneHint")}</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">{t("password")}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="h-11"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="h-11"
        />
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-ink">{t("intentSeeker")}</legend>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="intent"
            value="seeker"
            checked={intent === "seeker"}
            onChange={() => setIntent("seeker")}
          />
          {t("intentSeeker")}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="intent"
            value="lister"
            checked={intent === "lister"}
            onChange={() => setIntent("lister")}
          />
          {t("intentLister")}
        </label>
      </fieldset>

      {intent === "lister" ? (
        <div className="space-y-1.5">
          <Label htmlFor="listerType">{t("listerType")}</Label>
          <select
            id="listerType"
            name="listerType"
            required
            className="h-11 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            defaultValue="OWNER"
          >
            <option value="OWNER">{tLister("OWNER")}</option>
            <option value="BROKER">{tLister("BROKER")}</option>
            <option value="AGENCY">{tLister("AGENCY")}</option>
          </select>
        </div>
      ) : null}

      {state.error ? (
        <p className="text-sm text-danger" role="alert">
          {["phoneTaken", "invalidPhone", "passwordShort", "passwordMismatch", "nameShort", "listerTypeRequired", "invalid"].includes(
            state.error,
          )
            ? t(state.error as "phoneTaken")
            : t("invalid")}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="h-11 bg-bete text-paper hover:bg-bete-soft">
        {t("submitRegister")}
      </Button>

      <p className="text-sm text-ink-soft">
        {t("hasAccount")}{" "}
        <Link href="/login" className="font-medium text-bete underline underline-offset-4">
          {t("loginLink")}
        </Link>
      </p>
    </form>
  );
}
