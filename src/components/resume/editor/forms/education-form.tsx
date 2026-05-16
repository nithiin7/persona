"use client";

import { Education, Profile } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { ImportFromProfileDialog } from "../../management/dialogs/import-from-profile-dialog";
import { memo } from "react";
import Tiptap from "@/components/ui/tiptap";

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

  const inputClass =
    "h-8 border-gray-200 bg-white placeholder:text-gray-400 text-sm focus:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0";

  return (
    <div className="space-y-2">
      <div className="@container">
        <div className="flex flex-col @[400px]:flex-row gap-2">
          <Button
            variant="outline"
            className="flex-1 h-9 min-w-[120px] border-dashed border-gray-200 text-gray-400 text-sm hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors duration-150"
            onClick={addEducation}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5 shrink-0" />
            Add Education
          </Button>
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
            {/* Institution + delete */}
            <div className="flex items-end gap-2">
              <div className="space-y-1 flex-1 min-w-0">
                <label className="text-xs font-medium text-gray-500">
                  Institution
                </label>
                <Input
                  value={edu.school}
                  onChange={(e) =>
                    updateEducation(index, "school", e.target.value)
                  }
                  className={inputClass + " font-medium"}
                  placeholder="University Name"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeEducation(index)}
                className="h-8 w-8 shrink-0 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors duration-150"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">
                Location
              </label>
              <Input
                value={edu.location}
                onChange={(e) =>
                  updateEducation(index, "location", e.target.value)
                }
                className={inputClass}
                placeholder="City, Country"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">
                  Degree
                </label>
                <Input
                  value={edu.degree}
                  onChange={(e) =>
                    updateEducation(index, "degree", e.target.value)
                  }
                  className={inputClass}
                  placeholder="Bachelor's…"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">
                  Field
                </label>
                <Input
                  value={edu.field}
                  onChange={(e) =>
                    updateEducation(index, "field", e.target.value)
                  }
                  className={inputClass}
                  placeholder="Computer Science"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">
                  Date
                </label>
                <Input
                  type="text"
                  value={edu.date}
                  onChange={(e) =>
                    updateEducation(index, "date", e.target.value)
                  }
                  className={inputClass}
                  placeholder="2019 – 2023"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">
                  GPA <span className="text-gray-400">(optional)</span>
                </label>
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
                  className={inputClass}
                  placeholder="3.9"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-500">
                  Achievements
                </label>
                <span className="text-[10px] text-gray-400">One per line</span>
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
