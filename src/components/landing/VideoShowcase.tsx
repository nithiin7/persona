"use client";
import Image from "next/image";

export function VideoShowcase() {

  return (
    <section
      className="py-16 md:py-24 px-4 relative overflow-hidden"
      id="how-it-works"
    >
      {/* Simplified background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-teal-100/10"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-indigo-100/10"></div>

      <div className="container mx-auto max-w-6xl">
        {/* Section header */}
        <div className="text-center mb-12 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-teal-600">
            See Persona in Action
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how our AI-powered platform transforms your resume in minutes
          </p>
        </div>

        {/* Image showcase container */}
        <div className="relative mx-auto group">
          {/* Card effect container */}
          <div className="relative rounded-2xl bg-white border border-gray-200 shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg z-10">
            {/* Image showcase */}
            <div className="relative aspect-video w-full overflow-hidden">
              <Image
                src="/images/ss2.webp"
                alt="Persona Dashboard Showcase"
                fill
                className="object-cover rounded-2xl transition-transform duration-700 group-hover:scale-[1.02]"
                sizes="(min-width: 1024px) 80vw, 100vw"
                quality={100}
                priority
              />
              {/* Subtle overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/0 via-transparent to-teal-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none" />
            </div>
          </div>

          {/* Feature badges below image */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-sm border border-indigo-200 text-indigo-700">
              Intuitive Interface
            </span>
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-sm border border-indigo-200 text-indigo-700">
              User-friendly Design
            </span>
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-sm border border-indigo-200 text-indigo-700">
              Real-time AI Assistance
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
