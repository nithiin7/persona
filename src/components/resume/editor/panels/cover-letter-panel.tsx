import { Resume, Job } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, Plus, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { readStreamableValue } from "ai/rsc";
import type { AIConfig } from "@/utils/ai-tools";
import { AIImprovementPrompt } from "../../shared/ai-improvement-prompt";
import {
  generate,
  type CoverLetterStyle,
} from "@/utils/actions/cover-letter/actions";
import { useResumeContext } from "../resume-editor-context";
import { ApiErrorDialog } from "@/components/ui/api-error-dialog";
import { CreateTailoredResumeDialog } from "@/components/resume/management/dialogs/create-tailored-resume-dialog";

const STYLES: {
  value: CoverLetterStyle;
  label: string;
  description: string;
}[] = [
  {
    value: "professional",
    label: "Professional",
    description: "Formal, metric-driven",
  },
  { value: "casual", label: "Casual", description: "Conversational, warm" },
  {
    value: "startup",
    label: "Startup",
    description: "Punchy, gets to the point",
  },
];

interface CoverLetterPanelProps {
  resume: Resume;
  job: Job | null;
  aiConfig?: AIConfig;
}

export function CoverLetterPanel({
  resume,
  job,
  aiConfig,
}: CoverLetterPanelProps) {
  const { dispatch } = useResumeContext();
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] =
    useState<CoverLetterStyle>("professional");
  const [wordCountTarget, setWordCountTarget] = useState<number>(450);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState({
    title: "",
    description: "",
  });

  const updateField = (field: keyof Resume, value: Resume[keyof Resume]) => {
    dispatch({ type: "UPDATE_FIELD", field, value });
  };

  const generateCoverLetter = async () => {
    if (!job) return;
    setIsGenerating(true);
    try {
      const selectedModel = localStorage.getItem("persona-default-model");
      const storedKeys = localStorage.getItem("persona-api-keys");
      let apiKeys = [];
      try {
        apiKeys = storedKeys ? JSON.parse(storedKeys) : [];
      } catch {
        /* ignore */
      }

      const dateStr = new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const prompt = `Write a cover letter for the following job using my resume information:
      ${JSON.stringify(job)}
      ${JSON.stringify(resume)}
      Today's date is ${dateStr}.
      Full Name: ${resume.first_name} ${resume.last_name}
      Location: ${resume.location || ""}
      Email: ${resume.email}
      ${resume.phone_number ? `Phone: ${resume.phone_number}` : ""}
      ${resume.website ? `Portfolio: ${resume.website}` : ""}
      ${resume.linkedin_url ? `LinkedIn: ${resume.linkedin_url}` : ""}
      ${resume.github_url ? `GitHub: ${resume.github_url}` : ""}
      ${customPrompt ? `\nAdditional requirements: ${customPrompt}` : ""}`;

      const { output } = await generate(
        prompt,
        { ...aiConfig, model: selectedModel || "", apiKeys },
        selectedStyle,
        wordCountTarget
      );

      let generatedContent = "";
      for await (const delta of readStreamableValue(output)) {
        generatedContent += delta;
        updateField("cover_letter", { content: generatedContent });
      }
    } catch (error: Error | unknown) {
      const isKeyError =
        error instanceof Error &&
        (error.message.toLowerCase().includes("api key") ||
          error.message.toLowerCase().includes("unauthorized") ||
          error.message.toLowerCase().includes("invalid key") ||
          error.message.toLowerCase().includes("invalid x-api-key"));
      setErrorMessage(
        isKeyError
          ? {
              title: "API Key Error",
              description:
                "There was an issue with your API key. Please check your settings and try again.",
            }
          : {
              title: "Error",
              description: "Failed to generate cover letter. Please try again.",
            }
      );
      setShowErrorDialog(true);
    } finally {
      setIsGenerating(false);
    }
  };

  // Base resume state — can't generate a cover letter
  if (resume.is_base_resume) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 text-center">
        <div className="flex items-center gap-2 justify-center">
          <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center">
            <FileText className="h-4 w-4 text-gray-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900">Cover Letter</h3>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          Tailor this resume to a specific job first to generate a cover letter.
        </p>
        <CreateTailoredResumeDialog baseResumes={[resume]}>
          <Button
            variant="outline"
            size="sm"
            className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors duration-150"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Tailor This Resume
          </Button>
        </CreateTailoredResumeDialog>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-md bg-gray-100 flex items-center justify-center">
          <FileText className="h-3.5 w-3.5 text-gray-500" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900">Cover Letter</h3>
      </div>

      {resume.has_cover_letter ? (
        <div className="space-y-4">
          {/* Tone selector */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-gray-500">Tone</p>
            <div className="grid grid-cols-3 gap-1.5">
              {STYLES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSelectedStyle(s.value)}
                  className={cn(
                    "flex flex-col items-start gap-0.5 rounded-md border px-2 py-2 text-left transition-colors duration-150",
                    selectedStyle === s.value
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                  )}
                >
                  <span className="text-[10px] font-semibold leading-tight">
                    {s.label}
                  </span>
                  <span
                    className={cn(
                      "text-[9px] leading-tight",
                      selectedStyle === s.value
                        ? "text-gray-300"
                        : "text-gray-400"
                    )}
                  >
                    {s.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Word count selector */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-gray-500">Length</p>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { label: "Short", words: 300, sub: "~300 words" },
                  { label: "Standard", words: 450, sub: "~450 words" },
                  { label: "Detailed", words: 650, sub: "~650 words" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.words}
                  onClick={() => setWordCountTarget(opt.words)}
                  className={cn(
                    "flex flex-col items-start gap-0.5 rounded-md border px-2 py-2 text-left transition-colors duration-150",
                    wordCountTarget === opt.words
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                  )}
                >
                  <span className="text-[10px] font-semibold leading-tight">
                    {opt.label}
                  </span>
                  <span
                    className={cn(
                      "text-[9px] leading-tight",
                      wordCountTarget === opt.words
                        ? "text-gray-300"
                        : "text-gray-400"
                    )}
                  >
                    {opt.sub}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt */}
          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <AIImprovementPrompt
              value={customPrompt}
              onChange={setCustomPrompt}
              isLoading={isGenerating}
              placeholder="e.g., Focus on leadership experience and technical skills"
              hideSubmitButton
            />
          </div>

          <div className="space-y-2">
            <Button
              size="sm"
              className="w-full bg-gray-900 text-white hover:bg-gray-700 transition-colors duration-150"
              onClick={generateCoverLetter}
              disabled={isGenerating || !job}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  Generate with AI
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors duration-150"
              onClick={() => updateField("has_cover_letter", false)}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Delete Cover Letter
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-gray-400 leading-relaxed">
            No cover letter yet. Generate one tailored to this job posting with
            AI.
          </p>
          <Button
            size="sm"
            className="w-full bg-violet-600 hover:bg-violet-700 text-white transition-colors duration-150"
            onClick={() => updateField("has_cover_letter", true)}
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Create Cover Letter with AI
          </Button>
        </div>
      )}

      <ApiErrorDialog
        open={showErrorDialog}
        onOpenChange={setShowErrorDialog}
        errorMessage={errorMessage}
        onUpgrade={() => {
          setShowErrorDialog(false);
          window.location.href = "/subscription";
        }}
        onSettings={() => {
          setShowErrorDialog(false);
          window.location.href = "/settings";
        }}
      />
    </div>
  );
}
