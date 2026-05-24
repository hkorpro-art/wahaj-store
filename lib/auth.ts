import { SignJWT, jwtVerify } from "jose";

const encoder = new TextEncoder();

function adminSecret() {
  return process.env.WAHAJ_AUTH_SECRET || "wahaj-local-demo-secret-change-before-launch";
}

export function adminCredentials() {
  return {
    email: process.env.WAHAJ_ADMIN_EMAIL || "admin@wahaj.local",
    password: process.env.WAHAJ_ADMIN_PASSWORD || "wahaj-demo-2026"
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
