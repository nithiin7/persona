"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { AlertTriangle, RotateCcw, ArrowLeft } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="h-[calc(100vh-96px)] bg-white flex items-center justify-center px-4">
      <div
        className="fixed inset-0 opacity-[0.4] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,transparent_40%,white_100%)] pointer-events-none" />

      <div className="relative z-10 text-center max-w-sm animate-fade-in">
        <Logo asLink={false} className="justify-center mb-10" />

        <div className="h-12 w-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="h-5 w-5 text-red-500" />
        </div>

        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Something went wrong
        </h1>
        <p className="text-sm text-gray-500 mb-8 max-w-xs mx-auto">
          An unexpected error occurred. You can try again or head back home.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium transition-colors duration-150"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors duration-150"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
