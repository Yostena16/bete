import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { RegisterForm } from "@/components/auth/register-form";
import { auth } from "@/auth";
import { redirect } from "@/i18n/navigation";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("registerTitle"), description: t("registerLede") };
}

export default async function RegisterPage({ params }: PageProps) {
  const { locale } = await params;
  const session = await auth();
  if (session?.user) {
    redirect({ href: "/dashboard", locale });
  }

  const t = await getTranslations("auth");

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <div className="mx-auto w-full max-w-md px-4 py-12 sm:px-6">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
            {t("registerTitle")}
          </h1>
          <p className="mt-2 text-sm text-ink-soft">{t("registerLede")}</p>
          <div className="mt-8 rounded-xl border border-stone-soft bg-surface p-6">
            <RegisterForm />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
