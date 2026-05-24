# ظ†ط´ط± ظ…ظˆظ‚ط¹ ظˆظ‡ط§ط¬ ط¹ظ„ظ‰ Netlify

ط§ظ„ظ…ظˆظ‚ط¹ ظ„ظٹط³ ط«ظ‚ظٹظ„ظ‹ط§. ط­ط¬ظ… ظ…ظ„ظپط§طھ ط§ظ„ظ…طµط¯ط± ط¨ط¯ظˆظ† `node_modules` ظˆ`.next` ط­ظˆط§ظ„ظٹ 1MB ظپظ‚ط·.

ط§ظ„ظ…ط´ظƒظ„ط© ط؛ط§ظ„ط¨ظ‹ط§ طھط­ط¯ط« ط¹ظ†ط¯ ط±ظپط¹ ظ…ط¬ظ„ط¯ ط§ظ„ظ…ط´ط±ظˆط¹ ظƒط§ظ…ظ„ظ‹ط§ ظٹط¯ظˆظٹظ‹ط§ ظˆظپظٹظ‡:

- `node_modules`
- `.next`
- ظ…ظ„ظپط§طھ log
- `tsconfig.tsbuildinfo`
- ظ…ط¬ظ„ط¯ `artifacts`

ظ‡ط°ظ‡ ط§ظ„ظ…ظ„ظپط§طھ ظ„ط§ ظٹط¬ط¨ ط±ظپط¹ظ‡ط§. Netlify ظٹط¨ظ†ظٹظ‡ط§ ط¨ظ†ظپط³ظ‡.

## ط§ظ„ط·ط±ظٹظ‚ط© ط§ظ„طµط­ظٹط­ط©

ط§ظ„ط£ظپط¶ظ„ ظ†ط´ط± ط§ظ„ظ…ط´ط±ظˆط¹ ط¹ط¨ط± GitHub ط«ظ… ط±ط¨ط·ظ‡ ظ…ط¹ Netlify:

1. ط§ط±ظپط¹ظٹ ظ…ظ„ظپط§طھ ط§ظ„ظ…ط´ط±ظˆط¹ ط¥ظ„ظ‰ GitHub.
2. ظپظٹ Netlify ط§ط®طھط§ط±ظٹ `Add new site`.
3. ط§ط®طھط§ط±ظٹ `Import an existing project`.
4. ط§ط±ط¨ط·ظٹ ظ…ط³طھظˆط¯ط¹ GitHub.
5. طھط£ظƒط¯ظٹ ط£ظ† ط§ظ„ط¥ط¹ط¯ط§ط¯ط§طھ ظ‡ظٹ:

```txt
Build command: npm run build
Publish directory: .next
Node version: 22
```

طھظ…طھ ط¥ط¶ط§ظپط© ظ‡ط°ظ‡ ط§ظ„ط¥ط¹ط¯ط§ط¯ط§طھ ظپظٹ `netlify.toml`.

## ظ„ط§ طھط³طھط®ط¯ظ…ظٹ Drag & Drop ظ„ظ„ظ…ط¬ظ„ط¯ ظƒط§ظ…ظ„ظ‹ط§

ط§ظ„ط³ط­ط¨ ظˆط§ظ„ط¥ظپظ„ط§طھ ظپظٹ Netlify ظ…ظ†ط§ط³ط¨ ط؛ط§ظ„ط¨ظ‹ط§ ظ„ظ„ظ…ظˆط§ظ‚ط¹ ط§ظ„ط«ط§ط¨طھط© ط§ظ„ط¬ط§ظ‡ط²ط©طŒ ظˆظ„ظٹط³ ظ…ط´ط±ظˆط¹ Next.js ظƒط§ظ…ظ„ ظپظٹظ‡:

- API routes
- Admin authentication
- Proxy middleware
- Next image optimization

ظ„ط°ظ„ظƒ ظ„ط§ طھط±ظپط¹ظٹ ط§ظ„ظ…ط´ط±ظˆط¹ ظƒظ…ظ„ظپ ط¹ط§ط¯ظٹ ظپظٹ Netlify Drop.

## ط§ظ„ظ…ظ„ظپط§طھ ط§ظ„طھظٹ طھط±ظپط¹ظٹظ†ظ‡ط§ ظ„ظ„ظ…ط³طھظˆط¯ط¹

ط§ط±ظپط¹ظٹ ظ‡ط°ظ‡:

- `app`
- `components`
- `lib`
- `public`
- `package.json`
- `package-lock.json`
- `next.config.mjs`
- `netlify.toml`
- `postcss.config.mjs`
- `tailwind.config.ts`
- `tsconfig.json`
- `.env.example`

ظ„ط§ طھط±ظپط¹ظٹ ظ‡ط°ظ‡:

- `node_modules`
- `.next`
- `.env`
- `artifacts`
- `*.log`
- `*.tsbuildinfo`

## ظ…طھط؛ظٹط±ط§طھ ط§ظ„ط¨ظٹط¦ط© ط¹ظ„ظ‰ Netlify

ظ…ظ† Netlify:

`Site configuration` -> `Environment variables`

ط£ط¶ظٹظپظٹ:

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

ط¥ط°ط§ ظ„ظ… طھط³طھط®ط¯ظ…ظٹ Firebase ظˆCloudinary ط¨ط¹ط¯طŒ ظٹظ…ظƒظ† طھط±ظƒظ‡ط§ ظپط§ط±ط؛ط© ظ…ط¤ظ‚طھظ‹ط§طŒ ظ„ظƒظ† ظٹط¬ط¨ طھط؛ظٹظٹط± ط¨ظٹط§ظ†ط§طھ ط§ظ„ط£ط¯ظ…ظ† ظ‚ط¨ظ„ ط§ظ„ط¥ط·ظ„ط§ظ‚.

## ط§ط®طھط¨ط§ط± ظ…ط­ظ„ظٹ ظ‚ط¨ظ„ ط§ظ„ط±ظپط¹

```bash
npm install
npm run build
```

ط¥ط°ط§ ظ†ط¬ط­ ط§ظ„ط¨ظ†ط§ط، ظ…ط­ظ„ظٹظ‹ط§طŒ ظپط§ظ„ظ…ط´ط±ظˆط¹ ط¬ط§ظ‡ط² ظ„ظ„ظ†ط´ط± ط¹ظ„ظ‰ Netlify.

