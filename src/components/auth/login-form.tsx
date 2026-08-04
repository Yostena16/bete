"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { loginAction, type AuthActionState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: AuthActionState = { ok: false };

const ERROR_KEYS = new Set([
  "invalidCredentials",
  "phoneTaken",
  "invalidPhone",
  "passwordShort",
  "passwordMismatch",
  "nameShort",
  "listerTypeRequired",
  "invalid",
]);

function errorMessage(
  t: ReturnType<typeof useTranslations<"auth">>,
  code?: string,
) {
  if (code && ERROR_KEYS.has(code)) {
    return t(code as "invalidCredentials");
  }
  return t("invalid");
}

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const t = useTranslations("auth");
  const [state, action, pending] = useActionState(loginAction, initial);

  return (
    <form action={action} className="flex flex-col gap-4">
      {callbackUrl ? (
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
      ) : null}

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
          autoComplete="current-password"
          required
          minLength={8}
          className="h-11"
        />
      </div>

      {state.error ? (
        <p className="text-sm text-danger" role="alert">
          {errorMessage(t, state.error)}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={pending}
        className="h-11 bg-bete text-paper hover:bg-bete-soft"
      >
        {t("submitLogin")}
      </Button>

      <p className="text-sm text-ink-soft">
        {t("noAccount")}{" "}
        <Link
          href="/register"
          className="font-medium text-bete underline underline-offset-4"
        >
          {t("registerLink")}
        </Link>
      </p>
    </form>
  );
}
