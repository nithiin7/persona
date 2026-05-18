"use client";

import { Language, Profile } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ImportFromProfileDialog } from "../../management/dialogs/import-from-profile-dialog";
import { FormField, FORM_INPUT_CLASS } from "@/components/ui/form-field";
import { DeleteButton } from "@/components/ui/delete-button";
import { AddItemButton } from "@/components/ui/add-item-button";
import { cn } from "@/lib/utils";

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

  return (
    <div className="space-y-2">
      <div className="@container">
        <div className="flex flex-col @[400px]:flex-row gap-2">
          <AddItemButton onClick={addLanguage} className="flex-1 min-w-[120px]">
            Add Language
          </AddItemButton>
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
