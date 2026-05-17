"use client";

import { Language } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface ProfileLanguagesFormProps {
  languages: Language[];
  onChange: (languages: Language[]) => void;
}

const inputClass =
  "h-8 border-gray-200 bg-white placeholder:text-gray-400 text-sm focus:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0";

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
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-medium text-gray-500">
              Language
            </label>
            <Input
              value={lang.language}
              onChange={(e) =>
                updateLanguage(index, "language", e.target.value)
              }
              className={inputClass + " font-medium"}
              placeholder="Spanish"
            />
          </div>
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-medium text-gray-500">
              Proficiency{" "}
              <span className="text-gray-400 font-normal">(opt)</span>
            </label>
            <Input
              value={lang.proficiency || ""}
              onChange={(e) =>
                updateLanguage(index, "proficiency", e.target.value)
              }
              className={inputClass}
              placeholder="Native / Fluent / …"
              list={`proficiency-list-${index}`}
            />
            <datalist id={`proficiency-list-${index}`}>
              {PROFICIENCY_LEVELS.map((level) => (
                <option key={level} value={level} />
              ))}
            </datalist>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeLanguage(index)}
            className="h-8 w-8 mt-5 shrink-0 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors duration-150"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}

      <Button
        variant="outline"
        onClick={addLanguage}
        className="w-full h-9 border-dashed border-gray-200 text-gray-400 text-sm hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors duration-150"
      >
        <Plus className="h-3.5 w-3.5 mr-1.5" />
        Add Language
      </Button>
    </div>
  );
}
