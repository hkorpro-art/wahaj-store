import { SignJWT, jwtVerify } from "jose";

const encoder = new TextEncoder();

function adminSecret() {
  return process.env.WAHAJ_AUTH_SECRET || "8226d5cb293e61826651a1cc460e18d2a40db1d54e6a440a31426794d2f8a5aa";
}

export function adminCredentials() {
  return {
    email: process.env.WAHAJ_ADMIN_EMAIL || "hkorpro@gmail.com",
    password: process.env.WAHAJ_ADMIN_PASSWORD || "44615449"
  };
}

export async function createAdminToken(email: string) {
  return new SignJWT({ email, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(encoder.encode(adminSecret()));
}

export async function verifyAdminToken(token?: string) {
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
