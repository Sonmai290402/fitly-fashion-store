import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookie = request.cookies.get("auth_token")?.value;

  let user = null;
  if (cookie) {
    try {
      const decoded = JSON.parse(atob(cookie));
      if (decoded.exp > Date.now() / 1000) {
        user = decoded;
      }
    } catch (error) {
      console.error("Invalid auth_token cookie", error);
    }
  }

  if (user && ["/login", "/signup"].includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!user && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && user.role !== "admin" && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith("/products/") && pathname !== "/products") {
    const subPath = pathname.substring("/products/".length);

    const segments = subPath.split("/").filter(Boolean);

    const url = new URL("/products", request.url);

    if (segments[0]) {
      url.searchParams.set("gender", segments[0]);
    }

    if (segments[1]) {
      url.searchParams.set("category", segments[1]);
    }
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/signup", "/admin/:path*", "/products/:path*"],
};
