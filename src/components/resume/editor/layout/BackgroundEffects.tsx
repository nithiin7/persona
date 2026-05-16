import { cn } from "@/lib/utils";

interface BackgroundEffectsProps {
  className?: string;
  isBaseResume?: boolean;
}

export function BackgroundEffects({ className }: BackgroundEffectsProps) {
  return (
    <div className={cn("fixed inset-0 z-0 bg-gray-50", className)}>
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-70" />
    </div>
  );
}
