import { Background } from "@/components/landing/Background";
import FeatureHighlights from "@/components/landing/FeatureHighlights";
import { Hero } from "@/components/landing/Hero";
import { VideoShowcase } from "@/components/landing/VideoShowcase";
import { Footer } from "@/components/layout/footer";
import { NavLinks } from "@/components/layout/nav-links";
import { Logo } from "@/components/ui/logo";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import Script from "next/script";

// Page-specific metadata that extends the base metadata from layout.tsx
export const metadata: Metadata = {
  title: "Persona - AI Resume Builder for Tech Jobs",
  description:
    "Create ATS-optimized tech resumes in under 10 minutes. 3x your interview chances with AI-powered resume tailoring.",
  openGraph: {
    title: "Persona - AI Resume Builder for Tech Jobs",
    description:
      "Create ATS-optimized tech resumes in under 10 minutes. 3x your interview chances with AI-powered resume tailoring.",
    url: "https://persona.com",
  },
  twitter: {
    title: "Persona - AI Resume Builder for Tech Jobs",
    description:
      "Create ATS-optimized tech resumes in under 10 minutes. 3x your interview chances with AI-powered resume tailoring.",
  },
};

export default async function Page() {
  // Check if user is authenticated
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is authenticated, redirect to home page
  if (user) {
    redirect("/home");
  }

  return (
    <>
      {/* JSON-LD structured data for SEO */}
      <Script
        id="schema-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Persona",
            applicationCategory: "BusinessApplication",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            description:
              "Create ATS-optimized tech resumes in under 10 minutes. 3x your interview chances with AI-powered resume tailoring.",
            operatingSystem: "Web",
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.8",
              ratingCount: "500",
            },
          }),
        }}
      />

      <main aria-label="Persona landing page" className=" ">
        {/* Simplified Navigation */}
        <nav
          aria-label="Main navigation"
          className="border-b border-gray-200 fixed top-0 w-full bg-white/95 z-[1000] transition-all duration-300 shadow-sm"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Logo />
              <div className="flex items-center gap-6">
                <NavLinks />
                <AuthDialog>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white"
                  >
                    Sign In
                  </Button>
                </AuthDialog>
              </div>
            </div>
          </div>
        </nav>

        {/* Background component */}
        <Background />

        {/* Main content */}
        <div className="relative z-10 mx-auto px-4 sm:px-6 lg:px-24 flex flex-col justify-center">
          {/* Hero Section */}
          <Hero />
        </div>

        {/* Video Showcase Section */}
        <section id="product-demo">
          <VideoShowcase />
        </section>

        {/* Feature Highlights Section */}
        <section id="features" aria-labelledby="features-heading">
          <FeatureHighlights />
        </section>

        <Footer variant="static" />
      </main>
    </>
  );
}
