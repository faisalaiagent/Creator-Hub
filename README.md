# Creator Hub — 5-Tool Edition (No Auth · No DB · AdSense-Ready)

This is a complete, self-contained Next.js project with 5 free AI tools:

1. Background Remover
2. Image Compressor
3. Caption Generator
4. Hashtag Generator
5. Video Title Generator

**No Clerk, no Prisma, no Redis.** Rate limiting is in-memory, per-IP, per-tool.
Designed to get you live and AdSense-eligible fast.

---

## 1. Install

```bash
cd simple-hub
npm install
```

---

## 2. Environment Variables

Copy `.env.example` → `.env.local` and fill in:

```env
GROQ_API_KEY=gsk_...               # https://console.groq.com
REMOVE_BG_API_KEY=...              # https://www.remove.bg/api
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

All 5 services have **free tiers** — enough to launch and test.

---

## 3. Run locally

```bash
npm run dev
```

Visit:
- `/` — homepage with all 5 tool cards
- `/tools/background-remover`
- `/tools/image-compressor`
- `/tools/caption-generator`
- `/tools/hashtag-generator`
- `/tools/title-generator`
- `/about`, `/contact`, `/privacy`, `/terms` — AdSense policy pages

---

## 4. Folder Structure

```
simple-hub/
├── app/
│   ├── layout.tsx              ← Root layout, header + footer (links policy pages)
│   ├── page.tsx                ← Homepage with tool grid
│   ├── globals.css
│   ├── about/page.tsx          ← AdSense required
│   ├── contact/page.tsx        ← AdSense required
│   ├── privacy/page.tsx        ← AdSense required
│   ├── terms/page.tsx          ← AdSense required
│   ├── tools/
│   │   ├── background-remover/{page.tsx, metadata.ts}
│   │   ├── image-compressor/{page.tsx, metadata.ts}
│   │   ├── caption-generator/{page.tsx, metadata.ts}
│   │   ├── hashtag-generator/{page.tsx, metadata.ts}
│   │   └── title-generator/{page.tsx, metadata.ts}
│   └── api/tools/
│       ├── background-remover/route.ts
│       ├── image-compressor/route.ts
│       ├── caption/route.ts
│       ├── hashtag/route.ts
│       └── title/route.ts
├── components/tools/ImageDropzone.tsx
├── hooks/
│   ├── useBgRemover.ts
│   ├── useImageCompressor.ts
│   ├── useCaptionGenerator.ts
│   ├── useHashtagGenerator.ts
│   └── useTitleGenerator.ts
├── lib/
│   ├── ai/
│   │   ├── groq.ts
│   │   └── prompts/{caption,hashtag,title}.ts
│   ├── storage/cloudinary.ts
│   ├── utils.ts                ← cn() helper
│   └── utils/rate-limit.ts     ← in-memory IP rate limiter
├── package.json
├── tailwind.config.ts
├── next.config.mjs
├── tsconfig.json
└── .env.example
```

---

## 5. What Changed vs. the Full SaaS Version

| Feature | Full version | This version |
|---|---|---|
| Auth | Clerk | ❌ None — open access |
| Database | Prisma + Postgres | ❌ None — stateless |
| Rate limiting | Redis (Upstash) | ✅ In-memory `Map`, per-IP |
| Generation history | Saved to DB | ✅ Client-side only (local state) |
| Usage limits | Per-user, per-plan | Per-IP, fixed daily caps |

### Daily limits (per IP, configurable in each `route.ts`)
| Tool | Limit |
|---|---|
| Background Remover | 10/day |
| Image Compressor | 20/day |
| Caption Generator | 15/day |
| Hashtag Generator | 15/day |
| Title Generator | 15/day |

⚠️ **Important**: In-memory rate limiting resets every time your server restarts
or redeploys (Vercel serverless functions are stateless between cold starts —
so limits are "soft" and per-instance). This is **fine for launch and AdSense
review**. Once you have real traffic, swap in Upstash Redis (a few lines of
change in `lib/utils/rate-limit.ts`).

---

## 6. Before Submitting to AdSense

✅ Already done for you:
- Privacy Policy (`/privacy`)
- Terms of Service (`/terms`)
- About page (`/about`)
- Contact page (`/contact`)
- Footer links to all 4 pages on every page

📝 **You should edit**:
1. Replace `creatorhub.io` with your actual domain in:
   - `app/layout.tsx` (`metadataBase`)
   - Each `metadata.ts` file in `app/tools/*/`
2. Replace `faisalagentai@gmail.com` with your contact email (already set to yours)
3. Update "Last updated" dates in `/privacy` and `/terms` when you edit them
4. Add your real logo (currently a simple "CH" badge)
5. Once deployed, add the AdSense script to `app/layout.tsx` `<head>`:
   ```html
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX" crossOrigin="anonymous"></script>
   ```

🎯 **AdSense approval tips**:
- Make sure all 5 tools actually work (test each one end-to-end with real API keys before applying)
- Add a few blog posts later — AdSense favors sites with genuine content depth
- Ensure site loads fast (Next.js + Vercel handles this well by default)
- Don't apply until the site has been live for at least a few days with some organic content

---

## 7. Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

Then add all `.env.local` variables to your Vercel project settings
(Project → Settings → Environment Variables).

---

## 8. Next Steps (Optional, Later)

- Add Upstash Redis for persistent rate limiting across deploys
- Add a simple blog (`/blog`) for AdSense content depth + SEO
- Add Google Analytics / PostHog
- Re-introduce Clerk + Prisma if you want user accounts, history, and paid plans later — the original full-SaaS routes are structurally identical, just add auth + DB calls back in
