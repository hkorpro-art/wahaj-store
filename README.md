# ظˆظ‡ط§ط¬ | WAHAJ

ظ…طھط¬ط± ط¥ظƒط³ط³ظˆط§ط±ط§طھ ظ†ط³ط§ط¦ظٹط© ظپط§ط®ط± Mobile First ظ…ط¹ ظ„ظˆط­ط© طھط­ظƒظ… ظƒط§ظ…ظ„ط©طŒ RTL ط¹ط±ط¨ظٹطŒ ط·ظ„ط¨ ط¹ط¨ط± ظˆط§طھط³ط§ط¨طŒ ظˆطھط¬ظ‡ظٹط²ط§طھ Firebase ظˆCloudinary.

## ط§ظ„طھط´ط؛ظٹظ„

```bash
npm install
npm run dev
```

ط§ظ„ط±ط§ط¨ط· ط§ظ„ظ…ط­ظ„ظٹ:

```txt
http://localhost:3000
```

## ظ„ظˆط­ط© ط§ظ„طھط­ظƒظ…

ط§ظ„ظ…ط³ط§ط±:

```txt
/admin
```

ط¨ظٹط§ظ†ط§طھ ط§ظ„ط¯ط®ظˆظ„ ط§ظ„ط§ظپطھط±ط§ط¶ظٹط© ظ„ظ„طھط·ظˆظٹط±:

```txt
admin@wahaj.local
wahaj-demo-2026
```

ظ‚ط¨ظ„ ط§ظ„ط¥ط·ظ„ط§ظ‚ ط§ظ„ط­ظ‚ظٹظ‚ظٹطŒ ط§ط¶ط¨ط· ط§ظ„ظ‚ظٹظ… ظپظٹ `.env` ط¨ظ†ط§ط،ظ‹ ط¹ظ„ظ‰ `.env.example`طŒ ط®طµظˆطµظ‹ط§:

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
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

## ط§ظ„ظپط­ظˆطµط§طھ

```bash
npm run typecheck
npm run build
```

ظ…ظ„ط§ط­ط¸ط© ط£ظ…ظ†ظٹط©: `npm audit` ظٹط±طµط¯ طھط­ط°ظٹط±ظ‹ط§ ظ…طھظˆط³ط·ظ‹ط§ ط¯ط§ط®ظ„ `next` ط¨ط³ط¨ط¨ ظ†ط³ط®ط© `postcss` ط§ظ„ظ…ط¶ظ…ظ‘ظ†ط© ط¯ط§ط®ظ„ظٹظ‹ط§. ط¢ط®ط± ظ†ط³ط®ط© Next ظ…ط³طھظ‚ط±ط© ظ…ط«ط¨طھط© ظ‡ظ†ط§ ظ‡ظٹ `16.2.6`طŒ ظˆ`npm audit fix --force` ظٹظ‚طھط±ط­ طھط®ظپظٹط¶ظ‹ط§ ظƒط¨ظٹط±ظ‹ط§ ظˆط؛ظٹط± ط¢ظ…ظ† ط¥ظ„ظ‰ Next 9طŒ ظ„ط°ظ„ظƒ ظ„ظ… ط£ط·ط¨ظ‚ظ‡.

## ط§ظ„ظ†ط´ط± ط¹ظ„ظ‰ Netlify

طھظ…طھ ط¥ط¶ط§ظپط© ط¥ط¹ط¯ط§ط¯ط§طھ Netlify ظپظٹ `netlify.toml`.

ط±ط§ط¬ط¹ظٹ [DEPLOY_NETLIFY.md](DEPLOY_NETLIFY.md) ظ‚ط¨ظ„ ط§ظ„ط±ظپط¹. ظ„ط§ طھط±ظپط¹ظٹ `node_modules` ط£ظˆ `.next`طŒ ظˆظ„ط§ طھط³طھط®ط¯ظ…ظٹ Drag & Drop ظ„ظ„ظ…ط¬ظ„ط¯ ظƒط§ظ…ظ„ظ‹ط§.

ط¥ط°ط§ ط£ط±ط¯طھظگ ط±ظپط¹ ظ…ظ„ظپ ظƒط§ظ…ظ„ ط¨ط¯ظˆظ† GitHubطŒ ط±ط§ط¬ط¹ظٹ [UPLOAD_FULL_FILE.md](UPLOAD_FULL_FILE.md).

## ط§ظ„ط®ط·ظˆط·

طھظ… ط§ط¹طھظ…ط§ط¯ ط®ط·ظˆط· ط«ظ…ط§ظ†ظٹط© ظ…ط­ظ„ظٹظ‹ط§ ط¯ط§ط®ظ„ `public/fonts`:

- `Thmanyah Sans` ظ„ظ„ظˆط§ط¬ظ‡ط©طŒ ط§ظ„ظ…ظ†طھط¬ط§طھطŒ ط§ظ„ط£ط²ط±ط§ط±طŒ ظ„ظˆط­ط© ط§ظ„طھط­ظƒظ…طŒ ظˆط§ظ„ظ…ط¯ط®ظ„ط§طھ.
- `Thmanyah Serif Display` ظ„ظ„ط¹ظ†ط§ظˆظٹظ† ط§ظ„ظپط§ط®ط±ط© ظˆط§ظ„ظ€ Hero ظˆط§ظ„طµظپط­ط§طھ ط§ظ„طھط­ط±ظٹط±ظٹط©.

ط§ظ„طھط­ظ…ظٹظ„ ظٹطھظ… ط¹ط¨ط± `next/font/local` ظ…ط¹ `preload` ظˆ`font-display: swap`طŒ ظˆطھظ… طھظپط¹ظٹظ„ ط®طµط§ط¦طµ OpenType: `ss01`, `salt`, `liga`, `calt`.

