import { NextResponse } from "next/server";
import { adminCredentials, createAdminToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, maxAttempts: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (record.count >= maxAttempts) {
    return false;
  }
  record.count++;
  return true;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  if (!checkRateLimit(`login:${ip}`, 10, 60000)) {
    return NextResponse.json({ message: "محاولات كثيرة جداً. حاولي بعد دقيقة." }, { status: 429 });
  }
  const payload = loginSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ message: "بيانات الدخول غير مكتملة." }, { status: 400 });
  }

  const expected = adminCredentials();

  if (payload.data.email !== expected.email || payload.data.password !== expected.password) {
    return NextResponse.json({ message: "البريد أو كلمة المرور غير صحيحة." }, { status: 401 });
  }

  const token = await createAdminToken(payload.data.email);
  const response = NextResponse.json({ ok: true });

  response.cookies.set("wahaj_admin", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
    path: "/"
  });

  return response;
}
