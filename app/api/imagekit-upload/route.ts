import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken } from "@/lib/auth";
import { getImageKitServer } from "@/lib/imagekit-server";
import { type ImageKitFolder } from "@/lib/imagekit";

export async function POST(request: Request) {
  // 1. Authenticate user
  const token = (await cookies()).get("wahaj_admin")?.value;
  const admin = await verifyAdminToken(token);

  if (!admin) {
    return NextResponse.json({ message: "غير مصرح." }, { status: 401 });
  }

  // 2. Initialize ImageKit server SDK
  const imagekit = getImageKitServer();
  if (!imagekit) {
    return NextResponse.json(
      { message: "ImageKit configuration is missing on server." },
      { status: 500 }
    );
  }

  try {
    // 3. Parse FormData
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as ImageKitFolder) || "/products";
    const fileName = formData.get("fileName") as string || "";

    if (!file) {
      return NextResponse.json(
        { message: "لم يتم تحديد أي ملف للرفع." },
        { status: 400 }
      );
    }

    // Validate folder parameter to match allowed folders
    const allowedFolders = new Set(["/products", "/categories", "/hero"]);
    if (!allowedFolders.has(folder)) {
      return NextResponse.json(
        { message: "مجلد الرفع غير صالح." },
        { status: 400 }
      );
    }

    // 4. Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 5. Upload to ImageKit
    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: fileName || file.name,
      folder: folder,
      useUniqueFileName: true
    });

    // 6. Return response
    return NextResponse.json({
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
      name: uploadResponse.name
    });
  } catch (error) {
    console.error("[ImageKit-Upload-Api] Error during upload:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "تعذر رفع الصورة من خلال الخادم." },
      { status: 502 }
    );
  }
}
