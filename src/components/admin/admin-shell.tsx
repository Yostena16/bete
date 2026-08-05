import { AdminNav } from "@/components/admin/admin-nav";

export function AdminShell({
  title,
  lede,
  pathname,
  children,
}: {
  title: string;
  lede: string;
  pathname: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        {title}
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">{lede}</p>
      <AdminNav pathname={pathname} />
      <div className="mt-8">{children}</div>
    </>
  );
}
