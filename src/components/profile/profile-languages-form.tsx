"use client";

import { Language } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { FormField, FORM_INPUT_CLASS } from "@/components/ui/form-field";
import { DeleteButton } from "@/components/ui/delete-button";
import { AddItemButton } from "@/components/ui/add-item-button";
import { cn } from "@/lib/utils";

interface ProfileLanguagesFormProps {
  languages: Language[];
  onChange: (languages: Language[]) => void;
}

const PROFICIENCY_LEVELS = [
  "Native",
  "Fluent",
  "Professional",
  "Conversational",
  "Basic",
];

export function ProfileLanguagesForm({
  languages,
  onChange,
}: ProfileLanguagesFormProps) {
  const addLanguage = () => {
    onChange([...languages, { language: "", proficiency: "" }]);
  };

  const updateLanguage = (
    index: number,
    field: keyof Language,
    value: string
  ) => {
    const updated = [...languages];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeLanguage = (index: number) => {
    onChange(languages.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {languages.map((lang, index) => (
        <div
          key={index}
          className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors duration-150"
        >
          <FormField label="Language" className="flex-1">
            <Input
              value={lang.language}
              onChange={(e) =>
                updateLanguage(index, "language", e.target.value)
              }
              className={cn(FORM_INPUT_CLASS, "font-medium")}
              placeholder="Spanish"
            />
          </FormField>
          <FormField label="Proficiency" hint="opt" className="flex-1">
            <Input
              value={lang.proficiency || ""}
              onChange={(e) =>
                updateLanguage(index, "proficiency", e.target.value)
              }
              className={FORM_INPUT_CLASS}
              placeholder="Native / Fluent / …"
              list={`proficiency-list-${index}`}
            />
            <datalist id={`proficiency-list-${index}`}>
              {PROFICIENCY_LEVELS.map((level) => (
                <option key={level} value={level} />
              ))}
            </datalist>
          </FormField>
          <DeleteButton
            onClick={() => removeLanguage(index)}
            className="mt-5"
          />
        </div>
      ))}

      <AddItemButton onClick={addLanguage} className="w-full">
        Add Language
      </AddItemButton>
    </div>
  );
}
