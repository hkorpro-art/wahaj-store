# وهاج | WAHAJ

متجر إكسسوارات نسائية فاخر Mobile First مع لوحة تحكم كاملة، RTL عربي، طلب عبر واتساب، وتجهيزات Firebase وImageKit.

## التشغيل

```bash
npm install
npm run dev
```

الرابط المحلي:

```txt
http://localhost:3000
```

## لوحة التحكم

المسار:

```txt
/admin
```

بيانات الدخول الافتراضية للتطوير:

```txt
admin@wahaj.local
wahaj-demo-2026
```

قبل الإطلاق الحقيقي، اضبطي القيم في `.env` بناءً على `.env.example`، خصوصًا:

```txt
WAHAJ_ADMIN_EMAIL
WAHAJ_ADMIN_PASSWORD
WAHAJ_AUTH_SECRET
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY
IMAGEKIT_PRIVATE_KEY
```

## الفحوصات

```bash
npm run typecheck
npm run build
```

ملاحظة أمنية: `npm audit` يرصد تحذيرًا متوسطًا داخل `next` بسبب نسخة `postcss` المضمّنة داخليًا. آخر نسخة Next مستقرة مثبتة هنا هي `16.2.6`، و`npm audit fix --force` يقترح تخفيضًا كبيرًا وغير آمن إلى Next 9، لذلك لم أطبقه.

## النشر على Vercel

اربطي المستودع مع Vercel واضبطي متغيرات البيئة نفسها الموجودة في `.env.example`. لا ترفعي `node_modules` أو `.next`.

## الخطوط

تم اعتماد خطوط ثمانية محليًا داخل `public/fonts`:

- `Thmanyah Sans` للواجهة، المنتجات، الأزرار، لوحة التحكم، والمدخلات.
- `Thmanyah Serif Display` للعناوين الفاخرة والـ Hero والصفحات التحريرية.

التحميل يتم عبر `next/font/local` مع `preload` و`font-display: swap`، وتم تفعيل خصائص OpenType: `ss01`, `salt`, `liga`, `calt`.
