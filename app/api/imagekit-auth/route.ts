import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken } from "@/lib/auth";
import { getImageKitServer } from "@/lib/imagekit-server";

export async function GET() {
  const token = (await cookies()).get("wahaj_admin")?.value;
  const admin = await verifyAdminToken(token);

  if (!admin) {
    return NextResponse.json({ message: "غير مصرح." }, { status: 401 });
  }

  const imagekit = getImageKitServer();

  if (!imagekit) {
    return NextResponse.json({ message: "ImageKit environment variables are missing." }, { status: 500 });
  }

  const authenticationParameters = imagekit.getAuthenticationParameters();
  return Response.json(authenticationParameters);
}
