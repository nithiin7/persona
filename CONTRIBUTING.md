# Contributing to Persona

Thanks for wanting to contribute! Persona is a community-first fork of ResumeLM — the goal is to keep it free, local-first, and easy to self-host. Any contribution, big or small, is welcome.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Ways to Contribute](#ways-to-contribute)
- [Local Development Setup](#local-development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [How to Submit a Pull Request](#how-to-submit-a-pull-request)
- [Adding a New AI Model](#adding-a-new-ai-model)
- [Adding a New Resume Template](#adding-a-new-resume-template)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## Code of Conduct

Please read [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) before contributing. We hold ourselves to a respectful, constructive standard.

---

## Ways to Contribute

You don't have to write code to contribute:

- **Fix a bug** — pick an issue tagged [`good first issue`](../../issues?q=label%3A%22good+first+issue%22) or [`bug`](../../issues?q=label%3Abug)
- **Add a resume template** — new layouts are always welcome
- **Add an AI model** — if a provider or model is missing, it's usually a small change
- **Improve documentation** — typos, unclear setup steps, missing examples
- **Report bugs** — use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md)
- **Suggest features** — use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md)
- **Share feedback** — open a discussion if you're unsure

---

## Local Development Setup

### Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | ≥ 20 | Use [nvm](https://github.com/nvm-sh/nvm) to manage versions |
| pnpm | ≥ 9 | `npm install -g pnpm` |
| Supabase CLI | latest | `npm install -g supabase` — for local DB |
| Docker | any | Optional, required for the containerized setup |
| Ollama | any | Optional, for local AI models |

### Step-by-step

```bash
# 1. Fork the repo on GitHub, then clone your fork
git clone https://github.com/<your-username>/persona.git
cd persona

# 2. Install dependencies
pnpm install

# 3. Copy and configure environment variables
cp .env.example .env
# Edit .env — the minimum required is just the Supabase config.
# GPT-4.1 Nano works with no AI key at all.

# 4. Set up the local database
supabase start          # spins up a local Postgres + Auth stack
supabase db push        # applies the schema from supabase/migrations/

# 5. Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Minimum viable .env (no AI key needed)

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<output from "supabase start">
SUPABASE_SERVICE_ROLE_KEY=<output from "supabase start">
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`supabase start` prints the values you need. GPT-4.1 Nano (the free, no-key model) works out of the box once Supabase is running.

### Using Ollama for 100% local AI

```bash
# Install Ollama from https://ollama.com, then:
ollama pull llama3.2

# In the app: Settings → API Keys → Ollama (Local AI) → Connect
# Point it at http://localhost:11434
```

---

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/         # Auth-protected routes
│   │   ├── home/            # Dashboard
│   │   ├── resumes/[id]/    # Resume editor
│   │   ├── profile/         # Master profile
│   │   └── settings/        # AI model & key config
│   ├── api/chat/            # Streaming AI endpoint
│   ├── admin/               # Admin panel
│   └── auth/                # Auth flows
├── components/
│   ├── resume/
│   │   ├── editor/          # Three-panel editor (forms, preview, chat)
│   │   └── templates/       # PDF template components
│   ├── settings/            # API key and model config UI
│   └── shared/              # Model selector, shared UI
├── lib/
│   ├── ai-models.ts         # ← All model/provider definitions live here
│   ├── types.ts             # Shared TypeScript types
│   ├── prompts.ts           # All AI system prompts
│   └── zod-schemas.ts       # Zod schemas for AI structured output
└── utils/
    ├── actions/             # Next.js Server Actions
    │   ├── resumes/         # Resume CRUD + AI generation
    │   ├── profiles/        # Profile CRUD + AI generation
    │   ├── jobs/            # Job CRUD + AI parsing
    │   └── cover-letter/    # Cover letter generation
    ├── ai-tools.ts          # initializeAIClient — model routing
    └── supabase/            # DB client helpers
```

---

## Coding Standards

We use ESLint and Prettier. They run automatically on `pnpm lint` and `pnpm format`.

### General rules

- **TypeScript everywhere** — no `any` unless there is genuinely no alternative; add a comment explaining why if you must use it
- **DRY** — if you write the same logic twice, extract it
- **Server vs. client** — keep data fetching and mutations in Server Actions or API routes; components should be as light as possible
- **`cn()` for class names** — always use `cn()` from `src/lib/utils.ts` for conditional Tailwind classes
- **Supabase client** — never import the Supabase client directly in components; use `createClient()` from `src/utils/supabase/server.ts` (server) or `src/utils/supabase/client.ts` (browser)
- **Model references** — always use `MODEL_DESIGNATIONS.*` from `src/lib/ai-models.ts`, not raw model ID strings
- **Comments** — write clear, concise comments that explain *why*, not *what*

### File naming

| Type | Convention | Example |
|---|---|---|
| Components | kebab-case | `resume-score-panel.tsx` |
| Server Actions | kebab-case | `resume-editor-actions.tsx` |
| Hooks | `use-` prefix | `use-debounced-value.ts` |
| Utility files | kebab-case | `ai-tools.ts` |

### Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add Mistral provider support
fix: correct PDF margin calculation for minimal template
docs: update Ollama setup steps in README
chore: bump ai-sdk to 4.1
refactor: extract model routing into getProviderForModel()
```

---

## How to Submit a Pull Request

1. **Open an issue first** for non-trivial changes — it avoids duplicate work and lets us align before you spend time coding
2. **Fork** the repo and create a branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. **Make your changes** following the coding standards above
4. **Run checks** before pushing:
   ```bash
   pnpm lint
   pnpm format:check
   pnpm build       # make sure it compiles cleanly
   ```
5. **Push** your branch and open a PR against `main`
6. **Fill in the PR template** — describe what changed and why
7. **Link the related issue** using `Closes #123` in the PR description

PRs are reviewed on a best-effort basis. Please be patient and respond to feedback constructively.

---

## Adding a New AI Model

All model configuration lives in **`src/lib/ai-models.ts`**. No other files need changing for most model additions.

### Step 1 — Add the model to `AI_MODELS`

```ts
{
  id: "mistral-large-latest",
  name: "Mistral Large",
  provider: "mistral",           // must match a key in PROVIDERS
  features: {
    isRecommended: false,
    maxTokens: 128000,
    supportsVision: false,
    supportsTools: true,
  },
  availability: {
    requiresApiKey: true,
    requiresPro: false,
  },
},
```

### Step 2 — Add the provider to `PROVIDERS` (if new)

```ts
mistral: {
  id: "mistral",
  name: "Mistral",
  apiLink: "https://console.mistral.ai/api-keys",
  logo: "/logos/mistral.png",
  envKey: "MISTRAL_API_KEY",
  sdkInitializer: "mistral",
},
```

### Step 3 — Add the ServiceName type

Open `src/lib/types.ts` and add `"mistral"` to the `ServiceName` union.

### Step 4 — Wire up the SDK in `initializeAIClient`

Open `src/utils/ai-tools.ts` and add a `case "mistral":` branch in the provider switch statement, mirroring how Anthropic or OpenAI is handled.

### Step 5 — Add the env key to `.env.example`

```env
# Mistral API Key
MISTRAL_API_KEY="your-mistral-api-key"
```

---

## Adding a New Resume Template

Templates are React components rendered by `@react-pdf/renderer`. They live in `src/components/resume/templates/`.

### Step 1 — Add the template name to the `ResumeTemplate` type

In `src/lib/types.ts`:

```ts
export type ResumeTemplate =
  | "classic"
  | "modern"
  | "minimal"
  | "your-new-template"   // ← add here
  // ...
```

### Step 2 — Create the template component

Create `src/components/resume/templates/YourNewTemplate.tsx`. Model it on an existing template like `ClassicTemplate.tsx`. It receives a `Resume` object as a prop and returns a `@react-pdf/renderer` `<Document>`.

### Step 3 — Register it in the template selector

Open `src/components/resume/editor/forms/template-selector.tsx` and add an entry to the `templates` array:

```ts
{
  id: "your-new-template",
  name: "Your Template Name",
  description: "Short description of the style",
  preview: "🎨",
  features: ["Tag one", "Tag two", "Tag three"],
  gradient: "from-rose-600 to-pink-600",
},
```

### Step 4 — Wire it into the PDF renderer

Open `src/components/resume/editor/preview/resume-pdf-document.tsx` and add your template to the switch/map that selects which component to render.

---

## Reporting Bugs

Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md). The more detail you include (steps to reproduce, browser, Node version, error messages), the faster it can be fixed.

---

## Suggesting Features

Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md). Describe the problem you're trying to solve, not just the solution — it helps us think through alternatives together.

---

## Questions?

Open a [GitHub Discussion](../../discussions) if you're unsure about something or want to talk through an idea before opening an issue or PR.
