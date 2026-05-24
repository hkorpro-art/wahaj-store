# رفع وهاج كملف كامل

إذا كنتِ تريدين رفع ملف واحد كامل، استخدمي:

```txt
wahaj-full-netlify-upload.zip
```

هذا الملف يحتوي كل ملفات المشروع المطلوبة، لكنه لا يحتوي:

- `node_modules`
- `.next`
- ملفات التشغيل المحلية

هذا مقصود وصحيح. هذه المجلدات لا تُرفع لأنها ثقيلة جدًا وNetlify يبنيها بنفسه.

## هل أرفعه بسحب وإفلات داخل Netlify؟

ليس للموقع الكامل.

Netlify Drag & Drop ينشر ملفات جاهزة كـ HTML/CSS/JS. أما هذا المشروع فهو Next.js ويحتاج build حتى تعمل:

- صفحات Next.js
- API routes
- لوحة التحكم
- تسجيل الدخول
- حماية `/admin`

لذلك لو رفعتِ ملف المشروع كاملًا في Drop قد لا يعمل كما تريدين.

## الطريقة بدون GitHub

افتحي Terminal داخل مجلد المشروع ثم نفذي:

```bash
npm install
npm run build
npm install -g netlify-cli
netlify login
netlify deploy --build
```

للنشر النهائي:

```bash
netlify deploy --build --prod
```

هذه الطريقة ترفع المشروع كاملًا إلى Netlify بدون GitHub، مع تشغيل build الصحيح.

## إذا أردتِ Drag & Drop فقط

يمكن تجهيز نسخة Static Upload، لكنها لن تحتوي على API ولوحة تحكم حقيقية. ستكون مناسبة فقط لواجهة المتجر والصفحات العامة.

للموقع الكامل كما هو الآن، استخدمي Netlify CLI أو GitHub.
