import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/auth/auth-dialog";

const features = [
  "Use your own API keys (OpenAI, Anthropic, OpenRouter)",
  "Unlimited base resumes",
  "Unlimited tailored resumes",
  "Access to all AI models",
  "Self-host option available",
];

export function PricingSection() {
  return (
    <section className="pb-16 px-4 sm:px-6 lg:px-8 relative">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 w-full h-full -z-10">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-violet-600/20 to-indigo-600/20 blur-3xl top-0 -left-32 animate-[move_8s_ease-in-out_infinite]" />
        <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-pink-600/20 to-rose-600/20 blur-3xl bottom-0 -right-32 animate-[move_9s_ease-in-out_infinite]" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Section Header */}
        <div className="text-center mb-24">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600 bg-clip-text text-transparent pb-3">
            Pricing
          </h2>
          <div className="flex flex-col items-center gap-3 mb-12">
            <div className="flex flex-col items-center px-6 py-2.5 rounded-full bg-gradient-to-r from-violet-600/10 to-blue-600/10 border border-violet-600/20 shadow-lg shadow-violet-600/5">
              <span className="text-sm font-medium bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                ⭐️ Free and open source
              </span>
            </div>
            <p className="text-sm text-muted-foreground hover:text-violet-600 transition-colors duration-300">
              Persona is free to use. Bring your own API keys to get started.
            </p>
          </div>
        </div>

        {/* Single Pricing Card */}
        <div className="max-w-sm mx-auto">
          <div className="relative rounded-2xl h-full transition-all duration-500">
            <div className="h-full rounded-2xl border border-white/40 bg-white/40 backdrop-blur-xl p-10 relative overflow-hidden group hover:shadow-2xl hover:shadow-violet-600/10 hover:-translate-y-1 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/80 to-indigo-600/80 opacity-[0.08] -z-10 transition-opacity duration-500 group-hover:opacity-[0.12]" />

              <div className="mb-10">
                <h3 className="text-2xl font-bold">Free</h3>
                <div className="mt-5 flex items-baseline">
                  <span className="text-6xl font-bold bg-gradient-to-r from-violet-600/80 to-indigo-600/80 bg-clip-text text-transparent">
                    $0
                  </span>
                </div>
                <p className="mt-3 text-muted-foreground">
                  Everything included, no subscription required
                </p>
              </div>

              <ul className="space-y-5 mb-10">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-4">
                    <div className="rounded-full p-1 bg-gradient-to-r from-violet-600/80 to-indigo-600/80">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <AuthDialog>
                <Button className="w-full bg-gradient-to-r from-violet-600/80 to-indigo-600/80 text-white shadow-lg hover:shadow-xl transition-all duration-500 h-12 text-base">
                  Get Started
                </Button>
              </AuthDialog>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
