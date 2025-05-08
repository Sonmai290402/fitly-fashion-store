import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
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
    const returnToParam = searchParams.get("return_to");

    const returnPathCookie = request.cookies.get("return_to")?.value;
    const returnPath = returnToParam || returnPathCookie;

    let response;

    if (returnPath) {
      const decodedPath = decodeURIComponent(returnPath);
      response = NextResponse.redirect(new URL(decodedPath, request.url));

      if (returnPathCookie) {
        response.cookies.delete("return_to");
      }
    } else {
      response = NextResponse.redirect(new URL("/", request.url));
    }

    return response;
  }

  if (!user && pathname.startsWith("/admin")) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.set("return_to", encodeURIComponent(pathname), {
      maxAge: 60 * 30,
      path: "/",
    });
    return response;
  }

  if (user && user.role !== "admin" && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (
    !user &&
    (pathname.startsWith("/profile") ||
      pathname.startsWith("/orders") ||
      pathname.startsWith("/checkout"))
  ) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.set("return_to", encodeURIComponent(pathname), {
      maxAge: 60 * 30,
      path: "/",
    });
    return response;
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
  matcher: [
    "/login",
    "/signup",
    "/admin/:path*",
    "/products/:path*",
    "/profile/:path*",
    "/orders/:path*",
    "/checkout/:path*",
  ],
};
