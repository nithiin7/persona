import { cn } from "@/lib/utils";

export const FORM_INPUT_CLASS =
  "h-8 border-gray-200 bg-white placeholder:text-gray-400 text-sm focus:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0";

interface FormFieldProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  hint,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1", className)}>
      {hint ? (
        <div className="flex items-baseline justify-between">
          <label className="text-xs font-medium text-gray-500">{label}</label>
          <span className="text-[10px] text-gray-400">{hint}</span>
        </div>
      ) : (
        <label className="text-xs font-medium text-gray-500">{label}</label>
      )}
      {children}
    </div>
  );
}
