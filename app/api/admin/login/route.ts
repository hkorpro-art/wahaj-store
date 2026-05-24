import { NextResponse } from "next/server";
import { adminCredentials, createAdminToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";

export async function POST(request: Request) {
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
