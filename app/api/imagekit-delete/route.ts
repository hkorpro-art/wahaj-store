import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifyAdminToken } from "@/lib/auth";
import { getImageKitServer } from "@/lib/imagekit-server";

const deleteSchema = z.object({
  fileId: z.string().min(1)
});

export async function POST(request: Request) {
  const token = (await cookies()).get("wahaj_admin")?.value;
  const admin = await verifyAdminToken(token);

  if (!admin) {
    return NextResponse.json({ message: "غير مصرح." }, { status: 401 });
  }

  const imagekit = getImageKitServer();

  if (!imagekit) {
    return NextResponse.json({ message: "ImageKit environment variables are missing." }, { status: 500 });
  }

  const json = await request.json().catch(() => null);
  const parsed = deleteSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ message: "معرف الملف غير صالح." }, { status: 400 });
  }

  try {
    await imagekit.deleteFile(parsed.data.fileId);
    return NextResponse.json({ message: "تم حذف الصورة من ImageKit." });
  } catch {
    return NextResponse.json({ message: "تعذر حذف الصورة من ImageKit." }, { status: 502 });
  }
}
