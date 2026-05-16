# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Design System

See **[DESIGN.md](./DESIGN.md)** for the complete design system — color palette, component patterns, animation utilities, and a "never use" list. **Always consult DESIGN.md before editing any UI file.**

## Project Overview

**Persona** is a personal fork of [ResumeLM](https://github.com/olyaiy/resume-lm) — an AI-powered resume builder. Stripe/payments have been completely removed; all users have full feature access. The app is built on Next.js 15 App Router, React 19, TypeScript, Shadcn UI, Tailwind CSS, and Supabase.

## Commands

```bash
pnpm dev          # Start dev server with Turbopack
pnpm build        # Production build
pnpm lint         # ESLint
pnpm format       # Prettier (write)
pnpm format:check # Prettier (check only)
```

No test suite is configured.

## Environment Variables

Copy `.env.example` to `.env`. Required variables:

| Variable                                              | Purpose                                        |
| ----------------------------------------------------- | ---------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`                            | Supabase project URL                           |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`                       | Supabase public key                            |
| `SUPABASE_SERVICE_ROLE_KEY`                           | Admin-level Supabase key (server only)         |
| `OPENAI_API_KEY`                                      | OpenAI (used for free-tier model gpt-4.1-nano) |
| `ANTHROPIC_API_KEY`                                   | Anthropic (server-side pro models)             |
| `OPENROUTER_API_KEY`                                  | OpenRouter (GPT OSS models via OpenRouter)     |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Rate limiting                                  |
| `NEXT_PUBLIC_SITE_URL`                                | Used in OpenRouter headers                     |

## Architecture

### Route Structure

```
src/app/
  page.tsx                      # Landing page (public)
  (dashboard)/                  # Auth-protected dashboard group
    home/                       # Dashboard home
    resumes/[id]/               # Resume editor (main feature)
    profile/                    # User profile management
    settings/                   # AI model/API key settings
  admin/                        # Admin panel (impersonation, user management)
  auth/                         # Login, callback, password reset
  api/chat/route.ts             # Streaming AI chat endpoint (Vercel AI SDK)
```

The `middleware.ts` runs on all non-public routes and delegates to `src/utils/supabase/middleware.ts` to refresh Supabase sessions.

### Data Layer

**Supabase** is the database and auth provider. Three main tables:

- `profiles` — one-to-one with `auth.users`, stores base resume content (work_experience, education, skills, projects, certifications as JSONB)
- `resumes` — full resume records; `is_base_resume=true` for master copies, `job_id` set for tailored resumes; includes `section_order`, `section_configs`, `document_settings` as JSONB
- `jobs` — job listings; public read, user-specific write

All RLS policies enforce user isolation. Use `createClient()` (cookie-based, for RSC/Server Actions) or `createServiceClient()` (service role, for admin ops) from `src/utils/supabase/server.ts`.

**Auth** — `getAuthenticatedUser()` in `src/utils/auth.ts` reads from a request-scoped in-memory cache (`AuthCache`) keyed by `x-request-id` header, falling back to Supabase. Use `getUserId()` as a shorthand in Server Actions.

### Server Actions

All mutations are Next.js Server Actions (files marked `"use server"`). They live in:

```
src/utils/actions/
  resumes/actions.ts    # CRUD for resumes
  resumes/ai.ts         # AI generation for resume content
  profiles/actions.ts   # CRUD for profile
  profiles/ai.ts        # AI generation for profile content
  jobs/actions.ts       # CRUD for jobs
  jobs/ai.ts            # AI job parsing
  cover-letter/actions.ts
  index.ts              # Re-exports
```

Also `src/app/(dashboard)/settings/actions.ts` for API key management and `src/app/admin/actions.ts` for admin ops.

### AI Layer

**`src/lib/ai-models.ts`** is the single source of truth for all models and providers. Key exports:

- `AI_MODELS` — registry of all supported models with features/availability
- `MODEL_DESIGNATIONS` — named slots (`FAST_CHEAP`, `FRONTIER`, `BALANCED`, etc.) used throughout the codebase instead of hardcoded model IDs. Change these to globally swap models.
- `MODEL_ALIASES` — maps legacy/shorthand IDs to current canonical IDs
- `initializeAIClient(config, isPro)` in `src/utils/ai-tools.ts` — returns a `LanguageModelV1` from the Vercel AI SDK; handles OpenAI, Anthropic, and OpenRouter dispatch

**AI usage patterns:**

- Structured outputs: `generateObject()` with Zod schemas from `src/lib/zod-schemas.ts`
- Streaming chat: `streamText()` via `POST /api/chat` with tool use (`src/lib/tools.ts`)
- All AI system prompts live in `src/lib/prompts.ts`

`isPro` is hardcoded to `true` in `api/chat/route.ts` (Stripe was removed — everyone is pro).

### Resume Editor

The editor at `/resumes/[id]` is the core feature. The server page (`page.tsx`) fetches data and passes it to `ResumeEditorClient` (a client component). State is managed via React `useReducer` with a context (`ResumeContext` in `resume-editor-context.tsx`):

- `dispatch({ type: "UPDATE_FIELD", field, value })` — updates any top-level Resume field
- `dispatch({ type: "SET_HAS_CHANGES", value: true })` — marks dirty state for unsaved-changes guard

The editor layout uses `react-resizable-panels` with three panels: editor forms (left), AI assistant chat (right), and PDF preview (center). The PDF is rendered with `@react-pdf/renderer` via `resume-pdf-document.tsx`.

**Templates** live in `src/components/resume/templates/` (`ClassicTemplate`, `ModernTemplate`, `MinimalTemplate`). The `ResumeTemplate` type in `src/lib/types.ts` lists all valid template names.

### Coding Patterns

**Types** — all shared types in `src/lib/types.ts`. Zod schemas (for AI structured output) in `src/lib/zod-schemas.ts`. Keep these in sync when adding new fields.

**`cn()`** — always use `cn()` from `src/lib/utils.ts` (wraps `clsx` + `tailwind-merge`) for conditional class names.

**Supabase client** — never import the Supabase client directly in components. Server Components and Server Actions call `createClient()` from `src/utils/supabase/server.ts`; browser components use `src/utils/supabase/client.ts`.

**Schema-first for new resume sections** — when adding a new section (e.g., publications): add the TypeScript type to `src/lib/types.ts`, the Zod schema to `src/lib/zod-schemas.ts`, add the JSONB column in Supabase, update `Resume` and `Profile` interfaces, then add the form component and wire it into the editor.

**Model selection** — always reference `MODEL_DESIGNATIONS.*` when calling `initializeAIClient` in AI server actions, not raw model ID strings. This keeps model changes centralized.

**Rate limiting** — Redis-backed via `src/lib/rateLimiter.ts` using Upstash. Applied at the API route level.
