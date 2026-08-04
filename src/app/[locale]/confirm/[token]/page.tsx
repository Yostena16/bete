import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Link } from "@/i18n/navigation";
import { applyConfirmToken } from "@/lib/listings/confirm-token";

type PageProps = {
  params: Promise<{ locale: string; token: string }>;
  searchParams: Promise<{ action?: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "confirm" });
  return { title: t("title") };
}

export default async function ConfirmTokenPage({
  params,
  searchParams,
}: PageProps) {
  const { token } = await params;
  const { action = "" } = await searchParams;
  const t = await getTranslations("confirm");
  const result = await applyConfirmToken(token, action);

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <div className="mx-auto w-full max-w-lg px-4 py-16 sm:px-6">
          {result.ok ? (
            <>
              <h1 className="font-display text-2xl font-semibold text-ink">
                {result.action === "available"
                  ? t("availableTitle")
                  : t("takenTitle")}
              </h1>
              <p className="mt-3 text-sm text-ink-soft">
                {result.action === "available"
                  ? t("availableBody", {
                      title: result.title,
                      reference: result.reference,
                    })
                  : t("takenBody", {
                      title: result.title,
                      reference: result.reference,
                    })}
              </p>
            </>
          ) : (
            <>
              <h1 className="font-display text-2xl font-semibold text-ink">
                {t("errorTitle")}
              </h1>
              <p className="mt-3 text-sm text-ink-soft">
                {t(`errors.${result.error}`)}
              </p>
            </>
          )}
          <Link
            href="/dashboard"
            className="mt-8 inline-block text-sm font-medium text-bete underline underline-offset-4"
          >
            {t("toDashboard")}
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
