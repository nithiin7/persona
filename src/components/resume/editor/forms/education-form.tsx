"use client";

import { Education, Profile } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ImportFromProfileDialog } from "../../management/dialogs/import-from-profile-dialog";
import { memo } from "react";
import Tiptap from "@/components/ui/tiptap";
import { FormField, FORM_INPUT_CLASS } from "@/components/ui/form-field";
import { DeleteButton } from "@/components/ui/delete-button";
import { AddItemButton } from "@/components/ui/add-item-button";
import { cn } from "@/lib/utils";

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

            <FormField label="Achievements" hint="One per line">
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
            </FormField>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}, areEducationPropsEqual);
