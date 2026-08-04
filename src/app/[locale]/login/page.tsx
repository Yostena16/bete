import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { LoginForm } from "@/components/auth/login-form";
import { auth } from "@/auth";
import { redirect } from "@/i18n/navigation";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ callbackUrl?: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("loginTitle"), description: t("loginLede") };
}

export default async function LoginPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const session = await auth();
  if (session?.user) {
    redirect({ href: "/dashboard", locale });
  }

  const t = await getTranslations("auth");
  const { callbackUrl } = await searchParams;

  return (
    <>
      <SiteHeader />
      <main>
        <div className="mx-auto w-full max-w-md px-4 py-12 sm:px-6">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
            {t("loginTitle")}
          </h1>
          <p className="mt-2 text-sm text-ink-soft">{t("loginLede")}</p>
          <div className="mt-8 rounded-xl border border-stone-soft bg-surface p-6">
            <LoginForm callbackUrl={callbackUrl} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
