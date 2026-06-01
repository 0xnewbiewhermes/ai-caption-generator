# AI Caption Generator Indonesia

## Project
- AI-powered caption generator for Instagram, Twitter/X, TikTok
- Bahasa Indonesia-first
- Xiaomi MiMo v2.5 Pro API (OpenAI-compatible)
- Next.js 16 + TypeScript + Tailwind CSS v4

## Commands
- Dev: `npm run dev`
- Build: `npm run build`
- Deploy: Push to GitHub → Vercel auto-deploy

## Architecture
- `lib/mimo.ts` — MiMo API client with **prompt chaining** (2-step: expand → generate)
- `app/api/generate/route.ts` — API route with rate limiting
- `components/` — React client components
- All UI is custom Tailwind (no component library)

## Prompt Chaining Flow
1. User input singkat → "caption galau"
2. Step 1: expandTopic() → brief detail (audience, angle, struktur, emoji, hashtag)
3. Step 2: generateFromBrief() → caption final dari brief

## Environment
- `MIMO_API_KEY` — Xiaomi MiMo API key (in .env.local)
- MiMo Token Plan base URL: `https://token-plan-sgp.xiaomimimo.com/v1`
- ⚠️ Shell env var `MIMO_API_KEY` meng-override .env.local — pastikan tidak ada di shell

## Domain
- Production: https://aicaption.id
- GitHub: (pending)
