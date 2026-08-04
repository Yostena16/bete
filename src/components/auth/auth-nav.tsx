import { auth } from "@/auth";
import { signOutAction } from "@/app/actions/auth";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

/**
 * Server-rendered auth controls for the header. Keeps session reads off the
 * client so the chrome does not flash between signed-out and signed-in.
 */
export async function AuthNav() {
  const session = await auth();
  const t = await getTranslations("auth");
  const tNav = await getTranslations("nav");

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="focus-ring-on-dark hidden rounded-md border border-paper/25 px-3.5 py-2 text-sm font-medium text-paper transition-colors hover:bg-white/10 md:inline-block"
      >
        {tNav("signIn")}
      </Link>
    );
  }

  return (
    <div className="hidden items-center gap-2 md:flex">
      {session.user.role === "ADMIN" ? (
        <Link
          href="/admin"
          className="focus-ring-on-dark rounded-md px-3 py-2 text-sm font-medium text-paper/85 transition-colors hover:bg-white/10 hover:text-paper"
        >
          {tNav("admin")}
        </Link>
      ) : null}
      <Link
        href="/dashboard"
        className="focus-ring-on-dark rounded-md px-3 py-2 text-sm font-medium text-paper/85 transition-colors hover:bg-white/10 hover:text-paper"
      >
        {tNav("dashboard")}
      </Link>
      <form action={signOutAction}>
        <button
          type="submit"
          className="focus-ring-on-dark rounded-md border border-paper/25 px-3.5 py-2 text-sm font-medium text-paper transition-colors hover:bg-white/10"
        >
          {t("signOut")}
        </button>
      </form>
    </div>
  );
}
