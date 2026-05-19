"use client";

import { Education, Profile } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ImportFromProfileDialog } from "../../management/dialogs/import-from-profile-dialog";
import { memo, useState } from "react";
import Tiptap from "@/components/ui/tiptap";
import { FormField, FORM_INPUT_CLASS } from "@/components/ui/form-field";
import { DeleteButton } from "@/components/ui/delete-button";
import { AddItemButton } from "@/components/ui/add-item-button";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { useResumeContext } from "../resume-editor-context";
import { generateEducationAchievements } from "@/utils/actions/resumes/ai";

interface EducationFormProps {
  education: Education[];
  onChange: (education: Education[]) => void;
  profile: Profile;
}

function areEducationPropsEqual(
  prevProps: EducationFormProps,
  nextProps: EducationFormProps
) {
  return (
    JSON.stringify(prevProps.education) ===
      JSON.stringify(nextProps.education) &&
    prevProps.profile.id === nextProps.profile.id
  );
}

export const EducationForm = memo(function EducationFormComponent({
  education,
  onChange,
  profile,
}: EducationFormProps) {
  const { state } = useResumeContext();
  const { resume } = state;
  const [generatingAchievements, setGeneratingAchievements] = useState<{
    [key: number]: boolean;
  }>({});

  const handleGenerateAchievements = async (index: number) => {
    const edu = education[index];
    setGeneratingAchievements((prev) => ({ ...prev, [index]: true }));
    try {
      const MODEL_STORAGE_KEY = "persona-default-model";
      const LOCAL_STORAGE_KEY = "persona-api-keys";
      const selectedModel = localStorage.getItem(MODEL_STORAGE_KEY);
      let apiKeys = [];
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        apiKeys = stored ? JSON.parse(stored) : [];
      } catch {
        // ignore
      }
      const achievements = await generateEducationAchievements(
        {
          school: edu.school,
          degree: edu.degree,
          field: edu.field,
          date: edu.date,
        },
        resume,
        undefined,
        { model: selectedModel || "", apiKeys }
      );
      const updated = [...education];
      updated[index] = { ...updated[index], achievements };
      onChange(updated);
    } catch {
      // silently fail
    } finally {
      setGeneratingAchievements((prev) => ({ ...prev, [index]: false }));
    }
  };

  const addEducation = () => {
    onChange([
      {
        school: "",
        degree: "",
        field: "",
        location: "",
        date: "",
        gpa: undefined,
        achievements: [],
      },
      ...education,
    ]);
  };

  const updateEducation = (
    index: number,
    field: keyof Education,
    value: Education[keyof Education]
  ) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeEducation = (index: number) => {
    onChange(education.filter((_, i) => i !== index));
  };

  const handleImportFromProfile = (importedEducation: Education[]) => {
    onChange([...importedEducation, ...education]);
  };

  return (
    <div className="space-y-2">
      <div className="@container">
        <div className="flex flex-col @[400px]:flex-row gap-2">
          <AddItemButton
            onClick={addEducation}
            className="flex-1 min-w-[120px]"
          >
            Add Education
          </AddItemButton>
          <ImportFromProfileDialog<Education>
            profile={profile}
            onImport={handleImportFromProfile}
            type="education"
            buttonClassName="flex-1 mb-0 h-9 min-w-[120px] text-sm border-dashed border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors duration-150"
          />
        </div>
      </div>

      {education.map((edu, index) => (
        <Card
          key={index}
          className="bg-white border border-gray-200 rounded-lg shadow-sm"
        >
          <CardContent className="p-3 space-y-3">
            <div className="flex items-end gap-2">
              <FormField label="Institution" className="flex-1 min-w-0">
                <Input
                  value={edu.school}
                  onChange={(e) =>
                    updateEducation(index, "school", e.target.value)
                  }
                  className={cn(FORM_INPUT_CLASS, "font-medium")}
                  placeholder="University Name"
                />
              </FormField>
              <DeleteButton onClick={() => removeEducation(index)} />
            </div>

            <FormField label="Location">
              <Input
                value={edu.location}
                onChange={(e) =>
                  updateEducation(index, "location", e.target.value)
                }
                className={FORM_INPUT_CLASS}
                placeholder="City, Country"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-2">
              <FormField label="Degree">
                <Input
                  value={edu.degree}
                  onChange={(e) =>
                    updateEducation(index, "degree", e.target.value)
                  }
                  className={FORM_INPUT_CLASS}
                  placeholder="Bachelor's…"
                />
              </FormField>
              <FormField label="Field">
                <Input
                  value={edu.field}
                  onChange={(e) =>
                    updateEducation(index, "field", e.target.value)
                  }
                  className={FORM_INPUT_CLASS}
                  placeholder="Computer Science"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <FormField label="Date">
                <Input
                  type="text"
                  value={edu.date}
                  onChange={(e) =>
                    updateEducation(index, "date", e.target.value)
                  }
                  className={FORM_INPUT_CLASS}
                  placeholder="2019 – 2023"
                />
              </FormField>
              <FormField label="GPA" hint="optional">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.0"
                  value={edu.gpa || ""}
                  onChange={(e) =>
                    updateEducation(
                      index,
                      "gpa",
                      e.target.value ? parseFloat(e.target.value) : undefined
                    )
                  }
                  className={FORM_INPUT_CLASS}
                  placeholder="3.9"
                />
              </FormField>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-gray-500">
                    Achievements
                  </span>
                  <span className="text-[10px] text-gray-400">
                    (one per line)
                  </span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => handleGenerateAchievements(index)}
                  disabled={generatingAchievements[index]}
                  className="h-6 px-2 text-[11px] text-violet-600 hover:text-violet-700 hover:bg-violet-50 gap-1"
                >
                  {generatingAchievements[index] ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                  {generatingAchievements[index]
                    ? "Generating…"
                    : "AI Generate"}
                </Button>
              </div>
              <Tiptap
                content={(edu.achievements || []).join("\n")}
                onChange={(newContent) =>
                  updateEducation(
                    index,
                    "achievements",
                    newContent.split("\n").filter(Boolean)
                  )
                }
                editorProps={{
                  attributes: {
                    placeholder: "• Dean's List\n• Club President",
                  },
                }}
                className="min-h-[80px] border-gray-200 bg-white text-sm focus:border-gray-400 focus:ring-0 hover:border-gray-300"
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}, areEducationPropsEqual);
