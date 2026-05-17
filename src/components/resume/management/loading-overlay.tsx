"use client";

import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";
import { LoadingDots } from "@/components/ui/loading-dots";

export const CREATION_STEPS = [
  { id: "analyzing", label: "Analyzing Job Description" },
  { id: "formatting", label: "Formatting Requirements" },
  { id: "tailoring", label: "Tailoring Resume Content" },
  { id: "finalizing", label: "Finalizing Resume" },
] as const;

export type CreationStep = (typeof CREATION_STEPS)[number]["id"];

const stepDescription: Record<CreationStep, string> = {
  analyzing: "Reading and understanding the job requirements…",
  formatting: "Structuring the job information…",
  tailoring: "Optimizing your resume for the best match…",
  finalizing: "Putting the final touches…",
};

interface LoadingOverlayProps {
  currentStep: CreationStep;
}

export function LoadingOverlay({ currentStep }: LoadingOverlayProps) {
  const currentStepIndex = CREATION_STEPS.findIndex(
    (s) => s.id === currentStep
  );
  const progress = ((currentStepIndex + 1) / CREATION_STEPS.length) * 100;

  return (
    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
      <div className="max-w-sm w-full space-y-6 px-6">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span className="font-medium">Creating Resume</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {CREATION_STEPS.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = index < currentStepIndex;

            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200",
                  isActive && "bg-violet-50",
                  !isActive && !isCompleted && "opacity-40"
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                ) : isActive ? (
                  <div className="h-4 w-4 flex items-center justify-center shrink-0">
                    <LoadingDots className="text-violet-600" />
                  </div>
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-gray-300 shrink-0" />
                )}
                <span
                  className={cn(
                    "text-sm font-medium",
                    isActive && "text-violet-700",
                    isCompleted && "text-gray-500",
                    !isActive && !isCompleted && "text-gray-400"
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-gray-400 animate-pulse">
          {stepDescription[currentStep]}
        </p>
      </div>
    </div>
  );
}
