# Persona

**Your AI-powered resume builder — no subscriptions, no limits, runs on your machine.**

Persona is a personal fork of [ResumeLM](https://github.com/olyaiy/resume-lm) with Stripe and paywalls completely removed. Every feature is unlocked by default. Bring your own API keys or run entirely local models through Ollama.

---

## What it does

- **AI resume tailoring** — paste a job description and watch the AI rewrite your resume to match it
- **Live PDF preview** — see your formatted resume update as you type
- **AI chat assistant** — ask questions, request rewrites, and get feedback in a sidebar chat
- **ATS score** — instant compatibility score against any job posting
- **Cover letter generator** — one-click drafts based on your resume and the job
- **Multiple templates** — Classic, Modern, and Minimal layouts with full style control
- **Profile as source of truth** — maintain one master profile; spin off tailored resumes from it
- **Application status tracking** — track each job application through Saved → Applied → Phone Screen → Onsite → Offer / Rejected, visible on dashboard cards and in the resume editor

---

## Model support

Persona routes AI calls through whichever provider you configure. Mix and match per your needs:

| Provider | Notes |
|---|---|
| **Anthropic** (Claude) | Best quality; recommended for complex tailoring |
| **OpenAI** (GPT) | GPT-4.1 Nano is included free — no key required |
| **OpenRouter** | Access hundreds of models with one API key |
| **Ollama** | Run models locally — free, private, no internet required |

### Ollama (local AI)

No API key, no cloud, no cost. If you have [Ollama](https://ollama.com) installed:

```bash
ollama pull llama3.2   # or any model you like
```

Then go to **Settings → API Keys → Ollama (Local AI)**, click **Connect**, and your models appear in the model selector throughout the app.

---

## Tech stack

- **Next.js 15** — App Router, React Server Components, Server Actions
- **React 19** — concurrent rendering, optimistic updates
- **TypeScript** — strict types throughout
- **Shadcn UI + Tailwind CSS** — accessible components, utility-first styling
- **Supabase** — Postgres database, auth, row-level security
- **Vercel AI SDK** — unified streaming interface across all model providers
- **React PDF** — client-side PDF generation with `@react-pdf/renderer`
- **Upstash Redis** — rate limiting

---

## Getting started

### Prerequisites

- Node.js 18+
- pnpm
- A [Supabase](https://supabase.com) project (free tier is fine)

### 1. Clone and install

```bash
git clone <https://github.com/nithiin7/persona>
cd persona
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI providers — add whichever you want to use
OPENAI_API_KEY=sk-...           # optional; GPT-4.1 Nano is always free
ANTHROPIC_API_KEY=sk-ant-...    # optional; unlocks Claude models
OPENROUTER_API_KEY=sk-or-...    # optional; unlocks OpenRouter catalog

# Rate limiting (optional but recommended)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Public site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

You don't need all keys. The app works with just Supabase configured — GPT-4.1 Nano is available for free without any AI key.

### 3. Set up the database

Run the schema in your Supabase project's SQL editor (found in `supabase/`), or use the CLI:

```bash
supabase db push
```

### 4. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project structure

```
src/
  app/
    (dashboard)/          # Auth-protected pages
      home/               # Resume management dashboard
      resumes/[id]/       # Resume editor
      profile/            # Master profile
      settings/           # Model & API key config
    api/chat/             # Streaming AI chat endpoint
    admin/                # User management
    auth/                 # Login, signup, password reset
  components/
    resume/               # Editor panels, templates, PDF
    settings/             # API key and model configuration
    shared/               # Model selector, shared UI
  lib/
    ai-models.ts          # All model/provider definitions
    types.ts              # Shared TypeScript types
    prompts.ts            # AI system prompts
  utils/
    actions/              # Server Actions (AI, CRUD)
    ai-tools.ts           # initializeAIClient — model routing
    supabase/             # DB client helpers
```

---

## Key commands

```bash
pnpm dev           # Start dev server (Turbopack)
pnpm build         # Production build
pnpm lint          # ESLint
pnpm format        # Prettier (write)
pnpm format:check  # Prettier (check only)
```

---

## Adding a new AI model

All model configuration lives in [`src/lib/ai-models.ts`](src/lib/ai-models.ts). To add a model, append an entry to `AI_MODELS` with its provider, features, and availability — no other files need changing. To swap which model is used for a specific task (e.g. "fast cheap" or "frontier"), update `MODEL_DESIGNATIONS` in the same file.

---

## Credits

This is a fork of [ResumeLM](https://github.com/olyaiy/resume-lm) by [@olyaiy](https://github.com/olyaiy). The original architecture, design, and core feature set are his work. This fork removes the payment layer and adds Ollama support.

**License:** AGPL-3.0 (same as upstream)
