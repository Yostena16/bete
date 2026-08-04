import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Post a listing",
};

export default async function PostPage() {
  const session = await auth();
  const t = await getTranslations("nav");

  return (
    <>
      <SiteHeader />
      <main>
        <div className="container-page py-12">
          <h1 className="font-display text-2xl font-semibold text-ink">
            {t("post")}
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            {session?.user?.name
              ? `Posting as ${session.user.name}.`
              : null}
          </p>
          <p className="mt-6 max-w-xl text-ink-soft">
            The multi-step wizard (type, location pin, details, amenities,
            photos, price, review) is the next piece.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
