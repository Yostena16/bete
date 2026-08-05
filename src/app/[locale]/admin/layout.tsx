import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { auth } from "@/auth";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  void locale;
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <div className="container-page py-10 md:py-14">{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}
