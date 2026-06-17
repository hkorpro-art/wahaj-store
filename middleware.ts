import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const encoder = new TextEncoder();

function adminSecret() {
  return process.env.WAHAJ_AUTH_SECRET || "8226d5cb293e61826651a1cc460e18d2a40db1d54e6a440a31426794d2f8a5aa";
}

async function verifyAdminToken(token?: string) {
  if (!token) {
    return null;
  }
  try {
    const { payload } = await jwtVerify(token, encoder.encode(adminSecret()));
    return payload.role === "admin" ? payload : null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("wahaj_admin")?.value;
    const admin = await verifyAdminToken(token);

    if (!admin) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/admin"]
};
