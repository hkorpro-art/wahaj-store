import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken } from "@/lib/auth";
import { uploadProductImage } from "@/lib/cloudinary";

const MAX_FILE_SIZE = 7 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export async function POST(request: Request) {
  const token = (await cookies()).get("wahaj_admin")?.value;
  const admin = await verifyAdminToken(token);

  if (!admin) {
    return NextResponse.json({ message: "غير مصرح." }, { status: 401 });
  }

  const formData = await request.formData();
  const files = formData.getAll("files").filter((item): item is File => item instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ message: "لم يتم إرسال أي ملفات." }, { status: 400 });
  }

  if (files.length > 8) {
    return NextResponse.json({ message: "الحد الأقصى 8 صور في الرفع الواحد." }, { status: 400 });
  }

  try {
    const uploaded = await Promise.all(
      files.map(async (file) => {
        if (!ALLOWED_TYPES.has(file.type)) {
          throw new Error(`نوع ملف غير مدعوم: ${file.name}`);
        }

        if (file.size > MAX_FILE_SIZE) {
          throw new Error(`حجم الملف كبير جداً: ${file.name}`);
        }

        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        const dataUri = `data:${file.type};base64,${base64}`;
        const result = await uploadProductImage(dataUri);
        return String(result.secure_url || "");
      })
    );

    const urls = uploaded.filter(Boolean);
    return NextResponse.json({ urls });
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذر رفع الصور.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
