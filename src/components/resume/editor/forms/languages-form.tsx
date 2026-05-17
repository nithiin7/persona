"use client";

import { Language, Profile } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { ImportFromProfileDialog } from "../../management/dialogs/import-from-profile-dialog";
import React from "react";

const PROFICIENCY_LEVELS = [
  "Native",
  "Fluent",
  "Professional",
  "Conversational",
  "Basic",
];

interface LanguagesFormProps {
  languages: Language[];
  onChange: (languages: Language[]) => void;
  profile: Profile;
}

export function LanguagesForm({
  languages,
  onChange,
  profile,
}: LanguagesFormProps) {
  const addLanguage = () => {
    onChange([{ language: "", proficiency: "" }, ...languages]);
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

  const handleImportFromProfile = (imported: Language[]) => {
    onChange([...imported, ...languages]);
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
            onClick={addLanguage}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5 shrink-0" />
            Add Language
          </Button>
          <div className="flex-1 min-w-[120px]">
            <ImportFromProfileDialog
              profile={profile}
              type="languages"
              onImport={(data) => handleImportFromProfile(data as Language[])}
              buttonClassName="h-9 w-full mb-0 text-sm border-dashed border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors duration-150"
            />
          </div>
        </div>
      </div>

      {languages.map((lang, index) => (
        <Card
          key={index}
          className="bg-white border border-gray-200 rounded-lg shadow-sm"
        >
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="space-y-1 flex-1">
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
              <div className="space-y-1 flex-1">
                <label className="text-xs font-medium text-gray-500">
                  Proficiency <span className="text-gray-400">(opt)</span>
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
