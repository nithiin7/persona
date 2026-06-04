<div align="center">

<img src="public/android-chrome-512x512.png" alt="Persona" width="110" />

# Persona

**AI-powered resume builder — no subscriptions, no limits, runs on your machine.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/license-AGPL--3.0-22c55e)](LICENSE)
[![AI](https://img.shields.io/badge/AI-Claude%20·%20GPT%20·%20Ollama-7c3aed)](#model-support)

<br />

<img src="public/images/ss4.webp" alt="Persona Dashboard" width="860" />

</div>

---

Persona is a personal fork of [ResumeLM](https://github.com/olyaiy/resume-lm) with Stripe and all paywalls completely removed. Every feature is unlocked by default. Bring your own API keys, or run entirely local models through Ollama. **GPT-4.1 Nano is included free — no key required.**

---

## Features

<table>
<tr>
<td valign="top" width="50%">

**Resume building**

- AI tailoring from job descriptions
- Live PDF preview as you type
- Classic, Modern, and Minimal templates
- Profile-as-source-of-truth → spin off tailored resumes
- Version history with one-click restore

</td>
<td valign="top" width="50%">

**AI tools**

- Streaming chat assistant in the editor sidebar
- ATS score + persistent keyword highlighter
- One-click cover letter generator
- LinkedIn profile import (URL or paste)
- Inline AI assist: summaries, bullet suggestions, skill gaps

</td>
</tr>
<tr>
<td valign="top" width="50%">

**Job tracking**

- Drag-and-drop Kanban pipeline
- Saved → Applied → Phone Screen → Onsite → Offer / Rejected
- Status surfaced on resume cards and in the editor

</td>
<td valign="top" width="50%">

**Export & extras**

- Download as PDF or DOCX
- Resume diff view — compare tailored vs. base side-by-side
- Optional sections: Publications, Volunteer, Languages, Awards
- Profile photo rendered as circular headshot in PDF
- Section templates: pre-written bullets across 15 common roles

</td>
</tr>
</table>

---

## Screenshots

<div align="center">

|                            Resume Editor                             |                          AI Scoring & Suggestions                           |
| :------------------------------------------------------------------: | :-------------------------------------------------------------------------: |
| <img src="public/images/ss1.webp" width="420" alt="Resume editor" /> | <img src="public/images/ss2.webp" width="420" alt="AI suggestions panel" /> |

|                         Profile & Import                         |                            Fill from Profile                             |
| :--------------------------------------------------------------: | :----------------------------------------------------------------------: |
| <img src="public/images/ss4.webp" width="420" alt="Dashboard" /> | <img src="public/images/ss3.webp" width="420" alt="Fill from profile" /> |

</div>

---

## Model support

Mix and match providers — configure as many or as few as you want:

| Provider               | Notes                                            |
| ---------------------- | ------------------------------------------------ |
| **Anthropic** (Claude) | Best quality; recommended for complex tailoring  |
| **OpenAI** (GPT)       | GPT-4.1 Nano is free — no key required           |
| **OpenRouter**         | Hundreds of models with one API key              |
| **Ollama**             | Local models — free, private, no internet needed |

### Ollama (local AI)

```bash
ollama pull llama3.2   # or any model you like
```

Then go to **Settings → API Keys → Ollama (Local AI)**, click **Connect**, and your models appear in the model selector throughout the app.

---

## Getting started

### Prerequisites

- Node.js 18+
- pnpm
- A [Supabase](https://supabase.com) project (free tier works fine)

### 1. Clone and install

```bash
git clone https://github.com/nithiin7/persona
cd persona
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Supabase (required)
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

You don't need all keys. The app works with just Supabase — GPT-4.1 Nano is always available for free.

### 3. Set up the database

Run the schema in your Supabase SQL editor (found in `supabase/`), or use the CLI:

```bash
supabase db push
```

### 4. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Tech stack

| Layer           | Technology                                             |
| --------------- | ------------------------------------------------------ |
| Framework       | Next.js 15 — App Router, RSC, Server Actions           |
| UI              | Shadcn UI + Tailwind CSS                               |
| Language        | TypeScript (strict)                                    |
| Database & Auth | Supabase (Postgres + RLS)                              |
| AI SDK          | Vercel AI SDK — unified streaming across all providers |
| PDF             | `@react-pdf/renderer` — client-side generation         |
| Rate limiting   | Upstash Redis                                          |

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

All model configuration lives in [`src/lib/ai-models.ts`](src/lib/ai-models.ts). Append an entry to `AI_MODELS` with its provider, features, and availability — no other files need changing. To swap the model used for a specific task, update `MODEL_DESIGNATIONS` in the same file.

---

## Credits

This is a fork of [ResumeLM](https://github.com/olyaiy/resume-lm) by [@olyaiy](https://github.com/olyaiy). The original architecture, design, and core feature set are his work. This fork removes the payment layer, adds Ollama support, and ships a completely redesigned UI — simple, clean, and minimal throughout.

**License:** AGPL-3.0 (same as upstream)
