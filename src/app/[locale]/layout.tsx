import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { fontVariables } from "@/lib/fonts";
import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/site";
import "../globals.css";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Bete — homes that are still open",
    template: "%s · Bete",
  },
  description:
    "Property to rent and buy in Addis Ababa, where every listing shows the last time someone confirmed it was still available.",
  applicationName: "Bete",
  openGraph: {
    type: "website",
    locale: "en_ET",
    alternateLocale: ["am_ET"],
    siteName: "Bete",
    title: "Bete — homes that are still open",
    description:
      "Property to rent and buy in Addis Ababa, where every listing shows the last time someone confirmed it was still available.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Bete — homes that are still open",
    description:
      "Property to rent and buy in Addis Ababa, built around listing freshness.",
  },
  alternates: {
    languages: {
      en: `${siteUrl}/en`,
      am: `${siteUrl}/am`,
    },
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  return (
    <html lang={locale} className={fontVariables}>
      <body className="min-h-dvh bg-paper text-ink antialiased">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
