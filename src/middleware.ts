import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

const PROTECTED = ["/post", "/dashboard", "/saved", "/admin"];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const localeMatch = pathname.match(/^\/(en|am)(\/|$)/);
  const locale = localeMatch?.[1] ?? routing.defaultLocale;
  const pathWithoutLocale = localeMatch
    ? pathname.slice(locale.length + 1) || "/"
    : pathname;

  const needsAuth = PROTECTED.some(
    (route) =>
      pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`),
  );

  if (needsAuth) {
    const sessionToken =
      request.cookies.get("authjs.session-token")?.value ??
      request.cookies.get("__Secure-authjs.session-token")?.value;

    if (!sessionToken) {
      const login = new URL(`/${locale}/login`, request.url);
      login.searchParams.set("callbackUrl", pathWithoutLocale);
      return NextResponse.redirect(login);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/", "/(en|am)/:path*", "/((?!api|_next|_vercel|logo|.*\\..*).*)"],
};
