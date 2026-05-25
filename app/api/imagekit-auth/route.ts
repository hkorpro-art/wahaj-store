import ImageKit from "imagekit";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken } from "@/lib/auth";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ""
});

export async function GET() {
  const token = (await cookies()).get("wahaj_admin")?.value;
  const admin = await verifyAdminToken(token);

  if (!admin) {
    return NextResponse.json({ message: "غير مصرح." }, { status: 401 });
  }

  if (!process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT) {
    return NextResponse.json({ message: "ImageKit environment variables are missing." }, { status: 500 });
  }

  const authenticationParameters = imagekit.getAuthenticationParameters();
  return Response.json(authenticationParameters);
}
