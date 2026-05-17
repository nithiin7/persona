import { cn } from "@/lib/utils";
import { Copy, Brain } from "lucide-react";
import { ComponentPropsWithoutRef } from "react";

interface ImportMethodRadioItemProps extends ComponentPropsWithoutRef<"input"> {
  title: string;
  description: string;
  icon: React.ReactNode;
  id: string;
  accent?: "violet" | "gray";
}

function ImportMethodRadioItem({
  title,
  description,
  icon,
  id,
  accent = "gray",
  ...props
}: ImportMethodRadioItemProps) {
  return (
    <label htmlFor={id} className="h-full cursor-pointer">
      <input type="radio" className="sr-only peer" id={id} {...props} />
      <div
        tabIndex={0}
        className={cn(
          "flex flex-col items-center justify-center rounded-xl p-4",
          "bg-white border-2 h-full",
          "transition-all duration-150",
          accent === "violet"
            ? [
                "hover:border-violet-200 hover:bg-violet-50/40",
                "peer-checked:border-violet-600 peer-checked:bg-violet-50",
              ]
            : [
                "hover:border-gray-300 hover:bg-gray-50",
                "peer-checked:border-gray-900 peer-checked:bg-gray-50",
              ],
          "border-gray-200",
          "focus:outline-none"
        )}
      >
        <div className="flex flex-col items-center text-center gap-2">
          <div
            className={cn(
              "h-9 w-9 rounded-lg flex items-center justify-center",
              accent === "violet"
                ? "bg-violet-100 text-violet-600"
                : "bg-gray-100 text-gray-600"
            )}
          >
            {icon}
          </div>
          <div className="font-semibold text-xs text-gray-900">{title}</div>
          <span className="text-xs leading-snug text-gray-500">
            {description}
          </span>
        </div>
      </div>
    </label>
  );
}

interface ImportMethodRadioGroupProps {
  value: "import-profile" | "ai";
  onChange: (value: "import-profile" | "ai") => void;
}

export function ImportMethodRadioGroup({
  value,
  onChange,
}: ImportMethodRadioGroupProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <ImportMethodRadioItem
        name="tailorOption"
        value="ai"
        id="ai-tailor"
        checked={value === "ai"}
        onChange={() => onChange("ai")}
        accent="violet"
        title="Tailor with AI"
        description="AI analyzes the job description and optimizes your resume for the best match"
        icon={<Brain className="h-5 w-5" />}
      />
      <ImportMethodRadioItem
        name="tailorOption"
        value="import-profile"
        id="manual-tailor"
        checked={value === "import-profile"}
        onChange={() => onChange("import-profile")}
        accent="gray"
        title="Copy Base Resume"
        description="Create an exact copy and optionally link it to a job posting"
        icon={<Copy className="h-5 w-5" />}
      />
    </div>
  );
}
