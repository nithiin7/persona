import { AuthDialog } from "@/components/auth/auth-dialog";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Footer } from "@/components/layout/footer";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import {
  Sparkles,
  Target,
  MessageSquare,
  FileText,
  LayoutTemplate,
  Shield,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Script from "next/script";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Persona — AI Resume Builder",
  description:
    "Build ATS-optimized resumes with AI tailoring, scoring, and a built-in cover letter generator. 100% free and open-source.",
};

const features = [
  {
    icon: Sparkles,
    title: "AI Resume Tailoring",
    description:
      "Paste a job description and AI rewrites your resume to match — keywords, tone, and ATS optimization handled automatically.",
  },
  {
    icon: Target,
    title: "Resume Score",
    description:
      "Get an instant ATS compatibility score with specific, actionable suggestions before you hit send.",
  },
  {
    icon: MessageSquare,
    title: "AI Chat Assistant",
    description:
      "Ask Persona to rewrite bullet points, rephrase sections, or suggest improvements — all with full resume context.",
  },
  {
    icon: FileText,
    title: "Cover Letter Generator",
    description:
      "Generate a tailored, professional cover letter for any job in seconds. Adjust tone and style to match the role.",
  },
  {
    icon: LayoutTemplate,
    title: "10+ Templates",
    description:
      "Classic, modern, minimal, executive, and more. Every template is ATS-friendly and fully customizable.",
  },
  {
    icon: Shield,
    title: "Privacy-First",
    description:
      "Open-source and self-hostable. No ads, no data selling. Your resume data stays yours.",
  },
];

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/home");

  return (
    <>
      <Script
        id="schema-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Persona",
            applicationCategory: "BusinessApplication",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            description:
              "Build ATS-optimized resumes with AI tailoring, scoring, and a built-in cover letter generator.",
            operatingSystem: "Web",
          }),
        }}
      />

      {/* Nav */}
      <nav className="fixed top-0 w-full bg-white/95 border-b border-gray-200 z-50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Logo />
          <AuthDialog>
            <Button
              size="sm"
              className="bg-gray-900 hover:bg-gray-700 text-white transition-colors duration-150"
            >
              Sign In
            </Button>
          </AuthDialog>
        </div>
      </nav>

      <main>
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative h-[calc(100vh-56px)] flex items-center justify-center overflow-hidden bg-white">
          {/* Dot grid */}
          <div
            className="absolute inset-0 opacity-[0.4]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          {/* Soft vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,transparent_40%,white_100%)]" />

          <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-600 text-xs font-medium mb-8 animate-fade-in"
              style={{ animationDelay: "0ms" }}
            >
              <Sparkles className="h-3 w-3" />
              Open-source · 100% free
            </div>

            {/* Headline */}
            <h1
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-[1.08] animate-fade-up"
              style={{ animationDelay: "80ms" }}
            >
              The AI resume builder
              <br />
              <span className="text-gray-400">that gets you hired.</span>
            </h1>

            {/* Subheadline */}
            <p
              className="mt-6 text-lg text-gray-500 max-w-xl mx-auto leading-relaxed animate-fade-up"
              style={{ animationDelay: "180ms" }}
            >
              Build a base resume once. Let AI tailor it to every job posting,
              score it for ATS, and generate a matching cover letter — in
              minutes.
            </p>

            {/* CTA */}
            <div
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-up"
              style={{ animationDelay: "280ms" }}
            >
              <AuthDialog>
                <button className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium transition-colors duration-150">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </button>
              </AuthDialog>
              <span className="text-xs text-gray-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                No credit card required
              </span>
            </div>

            {/* Pills */}
            <div
              className="mt-10 flex flex-wrap items-center justify-center gap-2 animate-fade-up"
              style={{ animationDelay: "360ms" }}
            >
              {[
                "AI-Powered",
                "ATS-Optimized",
                "Privacy-First",
                "Open Source",
              ].map((label) => (
                <span
                  key={label}
                  className="px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-500 text-xs font-medium"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── The Resume Builder ───────────────────────────────── */}
        <section
          id="features"
          className="py-24 px-6 bg-gray-50 border-t border-gray-200"
        >
          <div className="max-w-5xl mx-auto">
            {/* Section label */}
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase text-center mb-4">
              What it does
            </p>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center tracking-tight mb-4">
              The Resume Builder
              <br />
              <span className="text-gray-400">That Gets You Hired</span>
            </h2>
            <p className="text-base text-gray-500 text-center max-w-xl mx-auto mb-14">
              Everything you need to build, tailor, and perfect your resume —
              powered by AI, designed to be fast.
            </p>

            {/* Feature grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map(({ icon: Icon, title, description }, i) => (
                <div
                  key={title}
                  className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3 animate-fade-up hover:border-gray-300 transition-colors duration-150"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      {title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Ready to land your dream job? ───────────────────── */}
        <section className="py-24 px-6 bg-white border-t border-gray-200">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-4">
              Ready to land your
              <br />
              dream job?
            </h2>
            <p className="text-base text-gray-500 mb-10 max-w-md mx-auto">
              Join hundreds of professionals already using Persona to build
              smarter resumes and get more interviews.
            </p>

            <AuthDialog>
              <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium transition-colors duration-150">
                <Sparkles className="h-4 w-4 text-violet-400" />
                Create Your Free Resume
              </button>
            </AuthDialog>

            <p className="mt-6 text-xs text-gray-400 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Free forever · No account required to browse
            </p>
          </div>
        </section>

        <Footer variant="static" />
      </main>
    </>
  );
}
