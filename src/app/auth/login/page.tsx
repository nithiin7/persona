import { Metadata } from "next";
import { MockResume } from "@/components/landing/mock-resume";
import { MockResumeMobile } from "@/components/landing/mock-resume-mobile";
import { BenefitsList } from "@/components/landing/benefits-list";
import { ActionButtons } from "@/components/landing/action-buttons";
import { Logo } from "@/components/ui/logo";
import { PricingSection } from "@/components/landing/pricing-section";
import { ErrorDialog } from "@/components/auth/error-dialog";
import { HowItWorks } from "@/components/landing/how-it-works";
import { HeroVideoSection } from "@/components/landing/hero-video-section";
import { Footer } from "@/components/layout/footer";
import { SplitContent } from "@/components/ui/split-content";
import { NavLinks } from "@/components/layout/nav-links";
import { ModelShowcase } from "@/components/landing/model-showcase";

export const metadata: Metadata = {
  title: "Login | Persona - AI-Powered Resume Builder",
  description:
    "Create tailored, ATS-optimized resumes powered by AI. Persona helps you land your dream tech job with personalized resume optimization.",
  keywords: [
    "resume builder",
    "AI resume",
    "ATS optimization",
    "tech jobs",
    "career tools",
    "job application",
  ],
  authors: [{ name: "Persona" }],
  openGraph: {
    title: "Persona - AI-Powered Resume Builder",
    description:
      "Create tailored, ATS-optimized resumes powered by AI. Land your dream tech job with personalized resume optimization.",
    url: "https://persona.com//",
    siteName: "Persona",
    images: [
      {
        url: "/og.webp",
        width: 1200,
        height: 630,
        alt: "Persona - AI Resume Builder",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Persona - AI-Powered Resume Builder",
    description:
      "Create tailored, ATS-optimized resumes powered by AI. Land your dream tech job with personalized resume optimization.",
    images: ["/og.webp"],
    creator: "@persona",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const showErrorDialog = params?.error === "auth_code_missing";

  return (
    <>
      <main className="relative overflow-x-hidden selection:bg-violet-200/50 ">
        {/* Error Dialog */}
        <ErrorDialog isOpen={!!showErrorDialog} />

        {/* Enhanced Navigation with backdrop blur and border */}
        <nav className="border-b border-white/50 backdrop-blur-xl shadow-md fixed top-0 w-full bg-white/20 z-[1000] transition-all duration-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Logo />
              <NavLinks />
            </div>
          </div>
        </nav>

        {/* Enhanced Content with better spacing and animations */}
        <div className="relative z-10">
          {/* Hero Section with Split Layout */}
          <div className="mb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 py-12 lg:py-24 items-center">
              {/* Left Column - Content */}
              <div className="flex flex-col gap-8 lg:gap-12 lg:pr-12">
                <div className="space-y-8">
                  <div className="space-y-5">
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                      <span className="inline-block bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600 bg-clip-text text-transparent animate-gradient-x pb-2">
                        Free AI Resume Builder
                      </span>
                      <br />
                      <span className="relative inline-block">
                        <span className="inline-block bg-gradient-to-r from-violet-500/90 via-blue-500/90 to-violet-500/90 bg-clip-text text-transparent animate-gradient-x">
                          that lands you tech jobs
                        </span>
                        <div className="absolute -bottom-2 left-0 w-24 sm:w-32 h-1.5 bg-gradient-to-r from-violet-500 to-blue-500 rounded-full" />
                      </span>
                    </h1>

                    <p className="text-xl sm:text-2xl text-muted-foreground/90 leading-relaxed max-w-2xl font-medium">
                      Create tailored, ATS-optimized resumes powered by AI.
                    </p>
                  </div>

                  <BenefitsList />
                </div>

                <ActionButtons />
              </div>

              {/* Right Column - Floating Resume Preview */}
              <div className="relative mt-8 lg:mt-0">
                {/* Mobile-only single resume view */}
                <div className="block lg:hidden">
                  <div className="relative w-full max-w-[min(85vw,_6in)] mx-auto transform hover:scale-[1.02] transition-transform duration-700">
                    {/* Decorative Elements - Enhanced gradients for mobile */}
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-blue-500/5 rounded-sm transform rotate-3 scale-[1.03] shadow-xl" />
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-blue-500/5 rounded-sm transform -rotate-3 scale-[1.03] shadow-xl" />

                    {/* Stacked Resume Previews - Mobile Optimized */}
                    <div className="relative">
                      {/* Background Resume - Third Layer */}
                      <div className="absolute -right-5 top-3 opacity-80 scale-[0.98] rotate-[-8deg] shadow-lg">
                        <MockResumeMobile />
                      </div>

                      {/* Middle Resume - Second Layer */}
                      <div className="absolute -right-2.5 top-1.5 opacity-90 scale-[0.99] rotate-[-4deg] origin-center shadow-lg">
                        <MockResumeMobile />
                      </div>

                      {/* Front Resume - Main Layer */}
                      <div className="relative shadow-xl transform transition-all duration-700 hover:translate-y-[-5px]">
                        <MockResumeMobile />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop stacked resume view */}
                <div className="relative hidden lg:block transform hover:scale-[1.02] transition-transform duration-700">
                  {/* Decorative Elements */}
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/8 to-blue-500/8 rounded-3xl transform rotate-6 scale-110 shadow-xl" />
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/8 to-blue-500/8 rounded-3xl transform -rotate-6 scale-110 shadow-xl" />

                  {/* Enhanced glow effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/20 via-blue-500/20 to-violet-500/20 rounded-3xl blur-xl opacity-70 group-hover:opacity-100 transition duration-1000"></div>

                  {/* Stacked Resume Previews with improved positioning and effects */}
                  <div className="relative">
                    {/* Background Resume - Third Layer */}
                    <div className="absolute -right-14 top-6 opacity-70 blur-[0.5px] scale-[0.96] rotate-[-10deg] origin-bottom-right shadow-xl">
                      <MockResume />
                    </div>

                    {/* Middle Resume - Second Layer */}
                    <div className="absolute -right-7 top-3 opacity-85 scale-[0.98] rotate-[-5deg] origin-bottom-right shadow-xl">
                      <MockResume />
                    </div>

                    {/* Front Resume - Main Layer */}
                    <div className="relative shadow-2xl transform transition-all duration-700 hover:translate-y-[-5px]">
                      <MockResume />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Hero Video Section with better framing */}
          <div className="relative py-16">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-50/30 to-transparent"></div>
            <HeroVideoSection />
          </div>

          {/* Enhanced Model Showcase with better spacing */}
          <div className="py-16 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/30 to-transparent"></div>
            <ModelShowcase />
          </div>

          {/* Enhanced Features Section with improved card styling */}
          <div className="flex flex-col gap-24 py-24 relative" id="features">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-50/30 to-transparent"></div>

            <SplitContent
              imageSrc="/SS Chat.png"
              heading="AI-Powered Resume Assistant"
              description="Get real-time feedback and suggestions from our advanced AI assistant. Optimize your resume content, improve your bullet points, and ensure your skills stand out to recruiters and ATS systems."
              imageOnLeft={false}
              imageOverflowRight={true}
            />

            <SplitContent
              imageSrc="/Dashboard Image.png"
              heading="Beautiful Resume Dashboard"
              description="Manage all your resumes in one place with our intuitive dashboard. Create base resumes, generate tailored versions for specific jobs, and track your application progress with ease."
              imageOnLeft={true}
            />

            <SplitContent
              imageSrc="/SS Score.png"
              heading="Resume Performance Scoring"
              description="Get detailed insights into your resume's effectiveness with our comprehensive scoring system. Track key metrics, identify areas for improvement, and optimize your resume to stand out to employers and ATS systems."
              imageOnLeft={false}
              imageOverflowRight={true}
            />

            <SplitContent
              imageSrc="/SS Cover Letter.png"
              heading="AI Cover Letter Generator"
              description="Create compelling, personalized cover letters in minutes with our AI-powered generator. Tailor your message to specific job opportunities while maintaining a professional and engaging tone that captures attention."
              imageOnLeft={true}
            />
          </div>

          {/* How It Works Section with improved framing */}
          <div id="how-it-works" className="relative py-16">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/30 to-transparent"></div>
            <HowItWorks />
          </div>

          {/* Pricing Section with improved framing */}
          <div id="pricing" className="relative py-16">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-50/30 to-transparent"></div>
            <PricingSection />
          </div>
        </div>
      </main>
      <Footer variant="static" />
    </>
  );
}
