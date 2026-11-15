import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LOCALE_COOKIE, LOCALE_HEADER, localeFromUrl, urlLocale, type UrlLocale } from "@/lib/i18n/locale";

function preferred(request: NextRequest): UrlLocale {
  const saved = localeFromUrl(request.cookies.get(LOCALE_COOKIE)?.value);
  return saved ? urlLocale(saved) : "hy";
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segment = pathname.split("/")[1] ?? "";

  if (segment === "am") {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/am(?=\/|$)/, "/hy") || "/hy";
    return NextResponse.redirect(url);
  }

  const locale = localeFromUrl(segment);
  if (locale) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(LOCALE_HEADER, locale);
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.cookies.set(LOCALE_COOKIE, locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return response;
  }

  const url = request.nextUrl.clone();
  const prefix = preferred(request);
  url.pathname = pathname === "/" ? `/${prefix}` : `/${prefix}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
