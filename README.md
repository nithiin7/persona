# Persona

> **⚠️ This is a personal fork of [ResumeLM](https://github.com/olyaiy/resume-lm) for personal use only.**

A free, open-source AI resume builder that helps create professional, ATS-optimized resumes. This fork has been rebranded to "Persona" and customized for personal use.

## 🙏 Credits

This project is a fork of [ResumeLM](https://github.com/olyaiy/resume-lm) by [@olyaiy](https://github.com/olyaiy). All credit for the original work goes to the original author.

**Original Repository:** [https://github.com/olyaiy/resume-lm](https://github.com/olyaiy/resume-lm)

## ⚠️ Personal Use Only

This fork is maintained for **personal use only**. It is not intended for public distribution or commercial use.

## ✨ Features

- 🤖 AI-Powered Resume Assistant with real-time feedback
- 📊 Resume Dashboard for managing multiple resumes
- 📈 ATS Compatibility Scoring
- 📝 AI Cover Letter Generator
- 🎨 Multiple resume templates and themes
- 📱 Mobile-responsive design

## 🛠️ Tech Stack

### Frontend & UI
- **Next.js 15** - App Router with React Server Components
- **React 19** - Latest React features
- **TypeScript** - Type-safe development
- **Shadcn UI** - UI components
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations

### AI & Intelligence
- **OpenAI GPT** - Content generation
- **Claude AI** - Alternative AI model support
- **Gemini AI** - Google's AI integration
- **DeepSeek** - Cost-effective AI processing
- **Groq** - High-speed AI inference

### Backend & Database
- **PostgreSQL** - Database
- **Supabase** - Backend-as-a-Service with auth
- **Row Level Security** - Security

### Additional Features
- **React PDF** - PDF generation
- **Stripe Integration** - Payment processing (optional)
- **Real-time Updates** - Live preview and editing

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- PostgreSQL database
- Supabase account

### Quick Start

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd persona
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Environment setup**
```bash
cp .env.example .env.local
```

4. **Configure environment variables**
```env
# Database
DATABASE_URL=your_postgresql_url
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Services
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_claude_key
GOOGLE_AI_API_KEY=your_gemini_key

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Payments (Optional)
STRIPE_SECRET_KEY=your_stripe_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=your_stripe_price_id
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

5. **Database setup**
```bash
# Run the schema.sql file in your Supabase SQL editor
# Or use the Supabase CLI:
supabase db push --db-url=your_supabase_db_url schema.sql
```

6. **Start development server**
```bash
pnpm dev
```

Visit `http://localhost:3000` to see your local Persona instance!

## 📊 Database Architecture

### Core Tables Structure

#### Profiles Table
- Stores user's base information and resume components
- JSON fields for complex data (work_experience, education, skills)
- One-to-one relationship with auth.users

#### Resumes Table
- Base and tailored resume versions
- Links to jobs for targeted applications
- JSONB for section_order and section_configs
- Version control and tracking

#### Jobs Table
- Job listings with requirements and details
- Salary range as flexible JSONB structure
- Application status tracking

### Security Features
- **Row Level Security (RLS)** - Users only access their own data
- **Authentication Integration** - Secure user management
- **Data Encryption** - Sensitive information protection

## 📄 License

**GNU Affero General Public License v3 (AGPL-3.0)**

This project is licensed under the AGPL-3.0 license. As a fork, it maintains the same license as the original project.

---

**Note:** This is a personal fork for personal use only. For the original project, please visit [ResumeLM](https://github.com/olyaiy/resume-lm).
