import { cn } from "@/lib/utils";
import { ResumeSummary } from "@/lib/types";
import { MiniResumePreview } from "../shared/mini-resume-preview";
import { Check, FileText } from "lucide-react";

interface BaseResumeSelectorProps {
  baseResumes: ResumeSummary[];
  selectedResumeId: string;
  onResumeSelect: (value: string) => void;
  isInvalid?: boolean;
}

export function BaseResumeSelector({
  baseResumes,
  selectedResumeId,
  onResumeSelect,
  isInvalid,
}: BaseResumeSelectorProps) {
  return (
    <div className={cn("space-y-3", isInvalid && "animate-pulse")}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {baseResumes?.map((resume) => {
          const isSelected = selectedResumeId === resume.id;

          return (
            <div
              key={resume.id}
              onClick={() => onResumeSelect(resume.id)}
              className={cn(
                "relative cursor-pointer group transition-all duration-150",
                "border-2 rounded-xl p-4 bg-white",
                isSelected
                  ? "border-gray-900 bg-gray-50 shadow-sm"
                  : "border-gray-200 hover:border-gray-400 hover:shadow-sm",
                isInvalid && !isSelected && "border-red-300 bg-red-50/30"
              )}
            >
              {/* Selection indicator */}
              <div
                className={cn(
                  "absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-150",
                  isSelected
                    ? "bg-gray-900 text-white scale-100"
                    : "bg-gray-200 text-gray-400 scale-0 group-hover:scale-100"
                )}
              >
                <Check className="w-3 h-3" />
              </div>

              {/* Resume preview */}
              <div className="mb-3">
                <MiniResumePreview
                  name={resume.name}
                  type="base"
                  createdAt={resume.created_at}
                  className="w-full h-28"
                />
              </div>

              {/* Resume details */}
              <div className="space-y-1.5">
                <div className="flex items-start gap-2">
                  <FileText className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-sm text-gray-900 truncate">
                      {resume.name}
                    </h3>
                    {resume.target_role && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {resume.target_role}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-400">
                  Created{" "}
                  {new Date(resume.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {isInvalid && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          Please select a base resume to continue.
        </p>
      )}
    </div>
  );
}
