import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, isValidGateToken } from "@/lib/gate";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const unlocked = await isValidGateToken(
    request.cookies.get(COOKIE_NAME)?.value,
  );

  if (pathname === "/enter") {
    if (unlocked) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!unlocked) {
    return NextResponse.redirect(new URL("/enter", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
