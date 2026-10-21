# النشر على Cloudflare Pages

Workers & Pages → Create → Pages → Connect to Git، ثم:

- Framework preset: None
- Build command: `npm install && npm run build:pages`
- Build output directory: `dist`

## Environment variables (Settings → Variables, للـ Production)
وقت البناء (ضرورية أثناء البناء):
- VITE_SUPABASE_URL
- VITE_SUPABASE_PUBLISHABLE_KEY
- VITE_SUPABASE_PROJECT_ID
- NITRO_PRESET = cloudflare-pages   (احتياط)

وقت التشغيل (Secrets):
- SUPABASE_URL
- SUPABASE_PUBLISHABLE_KEY
- SUPABASE_SERVICE_ROLE_KEY
- ADMIN_PASSWORD
- SESSION_SECRET (اختياري، 32 حرفًا فأكثر)

بعد تغيير أي متغير: Retry deployment.
