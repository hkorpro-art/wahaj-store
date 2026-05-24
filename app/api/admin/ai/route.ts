import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken } from "@/lib/auth";
import { aiRequestSchema } from "@/lib/validation";

async function requireAdmin() {
  const token = (await cookies()).get("wahaj_admin")?.value;
  return verifyAdminToken(token);
}

export async function POST(request: Request) {
  const admin = await requireAdmin();

  if (!admin) {
    return NextResponse.json({ message: "غير مصرح." }, { status: 401 });
  }

  const payload = aiRequestSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ message: "مدخلات غير صالحة." }, { status: 400 });
  }

  const { type, productName, details } = payload.data;
  const templates = {
    description: `${productName} قطعة فاخرة بلمعة ناعمة وتفاصيل Rose Gold مصممة لتمنح الإطلالة حضورًا أنثويًا راقيًا. ${details || ""}`,
    instagram: `لمسة وهاج الجديدة ✨\n${productName}\nتفاصيل ناعمة، لمعان راق، وحضور يليق بك.`,
    whatsapp: `مرحبًا الجميلة ✨ وصلتنا قطعة ${productName} بكمية محدودة ولمعة فاخرة تناسب مناسباتك وإطلالاتك اليومية.`,
    pricing: `اقتراح السعر: ابدئي بسعر متوسط أعلى من تكلفة القطعة بنسبة 42%، ثم فعلي خصمًا موسميًا لا يتجاوز 12% للحفاظ على إحساس الفخامة.`,
    image: `تحسين الصورة: خلفية ساتان فاتحة، إضاءة جانبية ناعمة، قص مربع 4:5، ورفع الحدة بنسبة بسيطة مع إبقاء اللون طبيعيًا.`
  };

  return NextResponse.json({ result: templates[type] });
}
