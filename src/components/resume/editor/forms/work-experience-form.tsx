"use client";

import { WorkExperience, Profile, Job } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Check,
  X,
  Loader2,
  Sparkles,
} from "lucide-react";
import { FormField, FORM_INPUT_CLASS } from "@/components/ui/form-field";
import { AddItemButton } from "@/components/ui/add-item-button";
import { cn } from "@/lib/utils";
import { ImportFromProfileDialog } from "../../management/dialogs/import-from-profile-dialog";
import { ApiErrorDialog } from "@/components/ui/api-error-dialog";

import { useState, useRef, useEffect, memo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import Tiptap from "@/components/ui/tiptap";
import {
  generateWorkExperiencePoints,
  improveWorkExperience,
} from "@/utils/actions/resumes/ai";
import { AIImprovementPrompt } from "../../shared/ai-improvement-prompt";
import { AIGenerationSettingsTooltip } from "../components/ai-generation-tooltip";
import { AISuggestions } from "../../shared/ai-suggestions";
import { SectionTemplatePicker } from "../components/section-template-picker";

interface AISuggestion {
  id: string;
  point: string;
}

interface WorkExperienceFormProps {
  experiences: WorkExperience[];
  onChange: (experiences: WorkExperience[]) => void;
  profile: Profile;
  targetRole?: string;
  job?: Job | null;
}

interface ImprovedPoint {
  original: string;
  improved: string;
}

interface ImprovementConfig {
  [key: number]: { [key: number]: string }; // expIndex -> pointIndex -> prompt
}

// Create a comparison function
function areWorkExperiencePropsEqual(
  prevProps: WorkExperienceFormProps,
  nextProps: WorkExperienceFormProps
) {
  return (
    prevProps.targetRole === nextProps.targetRole &&
    prevProps.job?.id === nextProps.job?.id &&
    JSON.stringify(prevProps.experiences) ===
      JSON.stringify(nextProps.experiences) &&
    prevProps.profile.id === nextProps.profile.id
  );
}

// Export the memoized component
export const WorkExperienceForm = memo(function WorkExperienceFormComponent({
  experiences,
  onChange,
  profile,
  targetRole = "Software Engineer",
  job,
}: WorkExperienceFormProps) {
  const [aiSuggestions, setAiSuggestions] = useState<{
    [key: number]: AISuggestion[];
  }>({});
  const [loadingAI, setLoadingAI] = useState<{ [key: number]: boolean }>({});
  const [loadingPointAI, setLoadingPointAI] = useState<{
    [key: number]: { [key: number]: boolean };
  }>({});
  const [aiConfig, setAiConfig] = useState<{
    [key: number]: { numPoints: number; customPrompt: string };
  }>({});
  const [popoverOpen, setPopoverOpen] = useState<{ [key: number]: boolean }>(
    {}
  );
  const textareaRefs = useRef<{ [key: number]: HTMLTextAreaElement }>({});
  // Always-current ref so debounced Tiptap callbacks don't close over stale experiences
  const experiencesRef = useRef(experiences);
  experiencesRef.current = experiences;
  const [improvedPoints, setImprovedPoints] = useState<{
    [key: number]: { [key: number]: ImprovedPoint };
  }>({});
  const [improvementConfig, setImprovementConfig] = useState<ImprovementConfig>(
    {}
  );
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState({
    title: "",
    description: "",
  });

  // Effect to focus textarea when popover opens
  useEffect(() => {
    Object.entries(popoverOpen).forEach(([index, isOpen]) => {
      if (isOpen && textareaRefs.current[Number(index)]) {
        // Small delay to ensure the popover is fully rendered
        setTimeout(() => {
          textareaRefs.current[Number(index)]?.focus();
        }, 100);
      }
    });
  }, [popoverOpen]);

  const addExperience = () => {
    onChange([
      {
        company: "",
        position: "",
        location: "",
        date: "",
        description: [],
        technologies: [],
      },
      ...experiences,
    ]);
  };

  const updateExperience = (
    index: number,
    field: keyof WorkExperience,
    value: string | string[]
  ) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeExperience = (index: number) => {
    onChange(experiences.filter((_, i) => i !== index));
  };

  const moveExperience = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= experiences.length) return;
    const updated = [...experiences];
    [updated[index], updated[targetIndex]] = [
      updated[targetIndex],
      updated[index],
    ];
    onChange(updated);
  };

  const handleImportFromProfile = (importedExperiences: WorkExperience[]) => {
    onChange([...importedExperiences, ...experiences]);
  };

  const generateAIPoints = async (index: number) => {
    const exp = experiences[index];
    const config = aiConfig[index] || { numPoints: 3, customPrompt: "" };
    setLoadingAI((prev) => ({ ...prev, [index]: true }));
    setPopoverOpen((prev) => ({ ...prev, [index]: false }));

    try {
      // Get model and API key from local storage
      const MODEL_STORAGE_KEY = "persona-default-model";
      const LOCAL_STORAGE_KEY = "persona-api-keys";

      const selectedModel = localStorage.getItem(MODEL_STORAGE_KEY);
      const storedKeys = localStorage.getItem(LOCAL_STORAGE_KEY);
      let apiKeys = [];

      try {
        apiKeys = storedKeys ? JSON.parse(storedKeys) : [];
      } catch (error) {
        console.error("Error parsing API keys:", error);
      }

      const result = await generateWorkExperiencePoints(
        exp.position,
        exp.company,
        exp.technologies || [],
        targetRole,
        config.numPoints,
        config.customPrompt,
        {
          model: selectedModel || "",
          apiKeys,
        },
        job?.description || undefined
      );

      const suggestions = result.points.map((point: string) => ({
        id: Math.random().toString(36).substr(2, 9),
        point,
      }));

      setAiSuggestions((prev) => ({
        ...prev,
        [index]: suggestions,
      }));
    } catch (error: Error | unknown) {
      if (
        error instanceof Error &&
        (error.message.toLowerCase().includes("api key") ||
          error.message.toLowerCase().includes("unauthorized") ||
          error.message.toLowerCase().includes("invalid key") ||
          error.message.toLowerCase().includes("invalid x-api-key"))
      ) {
        setErrorMessage({
          title: "API Key Error",
          description:
            "There was an issue with your API key. Please check your settings and try again.",
        });
      } else {
        setErrorMessage({
          title: "Error",
          description: "Failed to generate AI points. Please try again.",
        });
      }
      setShowErrorDialog(true);
    } finally {
      setLoadingAI((prev) => ({ ...prev, [index]: false }));
    }
  };

  const approveSuggestion = (expIndex: number, suggestion: AISuggestion) => {
    const updated = experiences.map((exp, i) =>
      i === expIndex
        ? { ...exp, description: [...exp.description, suggestion.point] }
        : exp
    );
    onChange(updated);

    // Remove the suggestion after approval
    setAiSuggestions((prev) => ({
      ...prev,
      [expIndex]: prev[expIndex].filter((s) => s.id !== suggestion.id),
    }));
  };

  const deleteSuggestion = (expIndex: number, suggestionId: string) => {
    setAiSuggestions((prev) => ({
      ...prev,
      [expIndex]: prev[expIndex].filter((s) => s.id !== suggestionId),
    }));
  };

  const rewritePoint = async (expIndex: number, pointIndex: number) => {
    const exp = experiences[expIndex];
    const point = exp.description[pointIndex];
    const customPrompt = improvementConfig[expIndex]?.[pointIndex];

    setLoadingPointAI((prev) => ({
      ...prev,
      [expIndex]: { ...(prev[expIndex] || {}), [pointIndex]: true },
    }));

    try {
      // Get model and API key from local storage
      const MODEL_STORAGE_KEY = "persona-default-model";
      const LOCAL_STORAGE_KEY = "persona-api-keys";

      const selectedModel = localStorage.getItem(MODEL_STORAGE_KEY);
      const storedKeys = localStorage.getItem(LOCAL_STORAGE_KEY);
      let apiKeys = [];

      try {
        apiKeys = storedKeys ? JSON.parse(storedKeys) : [];
      } catch (error) {
        console.error("Error parsing API keys:", error);
      }

      const improvedPoint = await improveWorkExperience(point, customPrompt, {
        model: selectedModel || "",
        apiKeys,
      });

      // Store both original and improved versions
      setImprovedPoints((prev) => ({
        ...prev,
        [expIndex]: {
          ...(prev[expIndex] || {}),
          [pointIndex]: {
            original: point,
            improved: improvedPoint,
          },
        },
      }));

      // Update the experience with the improved version
      const updated = experiences.map((exp, i) =>
        i === expIndex
          ? {
              ...exp,
              description: exp.description.map((d, j) =>
                j === pointIndex ? improvedPoint : d
              ),
            }
          : exp
      );
      onChange(updated);
    } catch (error: Error | unknown) {
      if (
        error instanceof Error &&
        (error.message.toLowerCase().includes("api key") ||
          error.message.toLowerCase().includes("unauthorized") ||
          error.message.toLowerCase().includes("invalid key") ||
          error.message.toLowerCase().includes("invalid x-api-key"))
      ) {
        setErrorMessage({
          title: "API Key Error",
          description:
            "There was an issue with your API key. Please check your settings and try again.",
        });
      } else {
        setErrorMessage({
          title: "Error",
          description: "Failed to improve point. Please try again.",
        });
      }
      setShowErrorDialog(true);
    } finally {
      setLoadingPointAI((prev) => ({
        ...prev,
        [expIndex]: { ...(prev[expIndex] || {}), [pointIndex]: false },
      }));
    }
  };

  const undoImprovement = (expIndex: number, pointIndex: number) => {
    const improvedPoint = improvedPoints[expIndex]?.[pointIndex];
    if (improvedPoint) {
      const updated = experiences.map((exp, i) =>
        i === expIndex
          ? {
              ...exp,
              description: exp.description.map((d, j) =>
                j === pointIndex ? improvedPoint.original : d
              ),
            }
          : exp
      );
      onChange(updated);

      // Remove the improvement from state
      setImprovedPoints((prev) => {
        const newState = { ...prev };
        if (newState[expIndex]) {
          delete newState[expIndex][pointIndex];
          if (Object.keys(newState[expIndex]).length === 0) {
            delete newState[expIndex];
          }
        }
        return newState;
      });
    }
  };

  const movePoint = (
    expIndex: number,
    pointIndex: number,
    direction: "up" | "down"
  ) => {
    const targetIndex = direction === "up" ? pointIndex - 1 : pointIndex + 1;
    const exp = experiences[expIndex];
    if (targetIndex < 0 || targetIndex >= exp.description.length) return;
    const desc = [...exp.description];
    [desc[pointIndex], desc[targetIndex]] = [
      desc[targetIndex],
      desc[pointIndex],
    ];
    const updated = experiences.map((e, i) =>
      i === expIndex ? { ...e, description: desc } : e
    );
    onChange(updated);
    setImprovedPoints((prev) => {
      if (!prev[expIndex]) return prev;
      const pts = { ...prev[expIndex] };
      delete pts[pointIndex];
      delete pts[targetIndex];
      return { ...prev, [expIndex]: pts };
    });
  };

  return (
    <>
      <div className="space-y-2 sm:space-y-3">
        <div className="@container">
          <div
            className={cn(
              "flex flex-col @[400px]:flex-row gap-2",
              "transition-all duration-300 ease-in-out"
            )}
          >
            <AddItemButton
              onClick={addExperience}
              className={cn(
                "flex-1 min-w-[120px]",
                "whitespace-nowrap text-[11px] @[300px]:text-sm"
              )}
            >
              Add Work Experience
            </AddItemButton>

            <ImportFromProfileDialog<WorkExperience>
              profile={profile}
              onImport={handleImportFromProfile}
              type="work_experience"
              buttonClassName={cn(
                "flex-1 mb-0 h-9 min-w-[120px]",
                "border-dashed border-gray-200 text-gray-400",
                "hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50",
                "transition-colors duration-150",
                "whitespace-nowrap text-[11px] @[300px]:text-sm"
              )}
            />
          </div>
        </div>

        {experiences.map((exp, index) => (
          <Card
            key={index}
            className="relative group transition-all duration-300 bg-white border border-gray-200 rounded-lg shadow-sm"
          >
            <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              {/* Header with Delete Button */}
              <div className="space-y-2 sm:space-y-3">
                {/* Company Name - Full Width */}
                <div className="flex items-end gap-2 sm:gap-3">
                  <FormField label="COMPANY" className="flex-1">
                    <Input
                      value={exp.company}
                      onChange={(e) =>
                        updateExperience(index, "company", e.target.value)
                      }
                      className={FORM_INPUT_CLASS}
                      placeholder="Company Name"
                    />
                  </FormField>
                  <div className="flex flex-col gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveExperience(index, "up")}
                      disabled={index === 0}
                      className="h-4 w-7 p-0 rounded text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-20 disabled:pointer-events-none"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveExperience(index, "down")}
                      disabled={index === experiences.length - 1}
                      className="h-4 w-7 p-0 rounded text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-20 disabled:pointer-events-none"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeExperience(index)}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-150"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Position and Location Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <FormField label="POSITION">
                    <Input
                      value={exp.position}
                      onChange={(e) =>
                        updateExperience(index, "position", e.target.value)
                      }
                      className={FORM_INPUT_CLASS}
                      placeholder="Position Title"
                    />
                  </FormField>
                  <FormField label="LOCATION">
                    <Input
                      value={exp.location}
                      onChange={(e) =>
                        updateExperience(index, "location", e.target.value)
                      }
                      className={FORM_INPUT_CLASS}
                      placeholder="Location"
                    />
                  </FormField>
                </div>

                {/* Dates Row */}
                <FormField label="DATE">
                  <Input
                    type="text"
                    value={exp.date}
                    onChange={(e) =>
                      updateExperience(index, "date", e.target.value)
                    }
                    className={cn(FORM_INPUT_CLASS, "w-full")}
                    placeholder="e.g., 'Jan 2023 - Present' or '2020 - 2022'"
                  />
                  <span className="ml-2 text-[8px] sm:text-[10px] text-gray-500">
                    Use &apos;Present&apos; in the date field for current
                    positions
                  </span>
                </FormField>

                {/* Description Section */}
                <div className="space-y-3">
                  <Label className="text-xs font-medium text-gray-500">
                    Key Responsibilities & Achievements
                  </Label>
                  <div className="space-y-2 pl-0">
                    {exp.description.map((desc, descIndex) => (
                      <div
                        key={descIndex}
                        className="flex gap-1 items-start group/item"
                      >
                        {/* Left: reorder (hidden until hover, only in normal mode) */}
                        <div className="shrink-0 flex flex-col gap-0.5 pt-1.5 w-5">
                          {!improvedPoints[index]?.[descIndex] && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  movePoint(index, descIndex, "up")
                                }
                                disabled={descIndex === 0}
                                className="h-5 w-5 p-0 rounded text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-20 disabled:pointer-events-none"
                              >
                                <ChevronUp className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  movePoint(index, descIndex, "down")
                                }
                                disabled={
                                  descIndex === exp.description.length - 1
                                }
                                className="h-5 w-5 p-0 rounded text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-20 disabled:pointer-events-none"
                              >
                                <ChevronDown className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>

                        {/* Center: text editor */}
                        <div className="flex-1">
                          <Tiptap
                            content={desc}
                            onChange={(newContent) => {
                              const updated = experiencesRef.current.map(
                                (exp, i) =>
                                  i === index
                                    ? {
                                        ...exp,
                                        description: exp.description.map(
                                          (d, j) =>
                                            j === descIndex ? newContent : d
                                        ),
                                      }
                                    : exp
                              );
                              onChange(updated);

                              if (improvedPoints[index]?.[descIndex]) {
                                setImprovedPoints((prev) => {
                                  const newState = { ...prev };
                                  if (newState[index]) {
                                    delete newState[index][descIndex];
                                    if (
                                      Object.keys(newState[index]).length === 0
                                    ) {
                                      delete newState[index];
                                    }
                                  }
                                  return newState;
                                });
                              }
                            }}
                            className={cn(
                              "min-h-[60px] text-xs md:text-sm bg-white/50 border-gray-200 rounded-lg",
                              "focus:border-gray-400 focus:ring-0",
                              "hover:border-gray-300 transition-colors",
                              "placeholder:text-gray-400",
                              improvedPoints[index]?.[descIndex] && [
                                "border-violet-300",
                                "bg-violet-50/60",
                              ]
                            )}
                          />

                          {improvedPoints[index]?.[descIndex] && (
                            <div className="absolute -top-2.5 right-12 px-2 py-0.5 bg-violet-100 rounded-full">
                              <span className="text-[10px] font-medium text-violet-600 flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                AI Suggestion
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Right: delete + AI (or accept/undo in AI mode) */}
                        <div className="shrink-0 flex flex-col gap-1 pt-0.5">
                          {improvedPoints[index]?.[descIndex] ? (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setImprovedPoints((prev) => {
                                    const newState = { ...prev };
                                    if (newState[index]) {
                                      delete newState[index][descIndex];
                                      if (
                                        Object.keys(newState[index]).length ===
                                        0
                                      ) {
                                        delete newState[index];
                                      }
                                    }
                                    return newState;
                                  });
                                }}
                                className="h-7 w-7 p-0 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700 border border-green-200/60 transition-colors"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  undoImprovement(index, descIndex)
                                }
                                className="h-7 w-7 p-0 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-600 border border-rose-200/60 transition-colors"
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const updated = experiences.map((exp, i) =>
                                    i === index
                                      ? {
                                          ...exp,
                                          description: exp.description.filter(
                                            (_, j) => j !== descIndex
                                          ),
                                        }
                                      : exp
                                  );
                                  onChange(updated);
                                }}
                                className="h-7 w-7 p-0 rounded-lg opacity-0 group-hover/item:opacity-100 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>

                              {/* AI IMPROVEMENT */}
                              <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        rewritePoint(index, descIndex)
                                      }
                                      disabled={
                                        loadingPointAI[index]?.[descIndex]
                                      }
                                      className="h-7 w-7 p-0 rounded-lg opacity-0 group-hover/item:opacity-100 text-violet-400 hover:text-violet-600 hover:bg-violet-50 transition-all"
                                    >
                                      {loadingPointAI[index]?.[descIndex] ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                      ) : (
                                        <Sparkles className="h-3.5 w-3.5" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="bottom"
                                    align="start"
                                    sideOffset={2}
                                    className="w-72 p-3.5 bg-white border border-gray-200 shadow-md rounded-lg"
                                  >
                                    <AIImprovementPrompt
                                      value={
                                        improvementConfig[index]?.[descIndex] ||
                                        ""
                                      }
                                      onChange={(value) =>
                                        setImprovementConfig((prev) => ({
                                          ...prev,
                                          [index]: {
                                            ...(prev[index] || {}),
                                            [descIndex]: value,
                                          },
                                        }))
                                      }
                                      onSubmit={() =>
                                        rewritePoint(index, descIndex)
                                      }
                                      isLoading={
                                        loadingPointAI[index]?.[descIndex]
                                      }
                                    />
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* AI Suggestions */}
                    <AISuggestions
                      suggestions={aiSuggestions[index] || []}
                      onApprove={(suggestion) =>
                        approveSuggestion(index, suggestion)
                      }
                      onDelete={(suggestionId) =>
                        deleteSuggestion(index, suggestionId)
                      }
                    />

                    {exp.description.length === 0 &&
                      !aiSuggestions[index]?.length && (
                        <div className="text-[11px] md:text-xs text-gray-500 italic px-4 py-3 bg-gray-50/50 rounded-lg">
                          Add points to describe your responsibilities and
                          achievements
                        </div>
                      )}
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const updated = experiences.map((exp, i) =>
                            i === index
                              ? {
                                  ...exp,
                                  description: [...exp.description, ""],
                                }
                              : exp
                          );
                          onChange(updated);
                        }}
                        className="flex-1 h-9 border-dashed border-gray-200 text-gray-400 text-[10px] sm:text-xs hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors duration-150"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Point
                      </Button>

                      {/* SECTION TEMPLATES */}
                      <SectionTemplatePicker
                        onInsert={(bullets) => {
                          const updated = experiences.map((exp, i) =>
                            i === index
                              ? {
                                  ...exp,
                                  description: [...exp.description, ...bullets],
                                }
                              : exp
                          );
                          onChange(updated);
                        }}
                      />
                    </div>

                    {/* AI GENERATION SETTINGS */}
                    <div className="flex">
                      <AIGenerationSettingsTooltip
                        index={index}
                        loadingAI={loadingAI[index]}
                        generateAIPoints={generateAIPoints}
                        aiConfig={
                          aiConfig[index] || { numPoints: 3, customPrompt: "" }
                        }
                        onNumPointsChange={(value) =>
                          setAiConfig((prev) => ({
                            ...prev,
                            [index]: { ...prev[index], numPoints: value },
                          }))
                        }
                        onCustomPromptChange={(value) =>
                          setAiConfig((prev) => ({
                            ...prev,
                            [index]: { ...prev[index], customPrompt: value },
                          }))
                        }
                        colorClass={{
                          button: "text-gray-900",
                          border: "border-gray-200",
                          hoverBorder: "hover:border-gray-300",
                          hoverBg: "hover:bg-gray-700",
                          tooltipBg: "bg-purple-50",
                          tooltipBorder: "border-2 border-purple-300",
                          tooltipShadow: "shadow-lg shadow-purple-100/50",
                          text: "text-white",
                          hoverText: "hover:text-white",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Error Alert Dialog at the end */}
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
    </>
  );
}, areWorkExperiencePropsEqual);
