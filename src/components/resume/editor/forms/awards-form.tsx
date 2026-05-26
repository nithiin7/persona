"use client";

import { Award, Profile } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ImportFromProfileDialog } from "../../management/dialogs/import-from-profile-dialog";
import { FormField, FORM_INPUT_CLASS } from "@/components/ui/form-field";
import { DeleteButton } from "@/components/ui/delete-button";
import { AddItemButton } from "@/components/ui/add-item-button";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";

interface AwardsFormProps {
  awards: Award[];
  onChange: (awards: Award[]) => void;
  profile: Profile;
}

export function AwardsForm({ awards, onChange, profile }: AwardsFormProps) {
  const addAward = () => {
    onChange([{ title: "", issuer: "", date: "", description: "" }, ...awards]);
  };

  const updateAward = (index: number, field: keyof Award, value: string) => {
    const updated = [...awards];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeAward = (index: number) => {
    onChange(awards.filter((_, i) => i !== index));
  };

  const moveAward = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= awards.length) return;
    const updated = [...awards];
    [updated[index], updated[targetIndex]] = [
      updated[targetIndex],
      updated[index],
    ];
    onChange(updated);
  };

  const handleImportFromProfile = (imported: Award[]) => {
    onChange([...imported, ...awards]);
  };

  return (
    <div className="space-y-2">
      <div className="@container">
        <div className="flex flex-col @[400px]:flex-row gap-2">
          <AddItemButton onClick={addAward} className="flex-1 min-w-[120px]">
            Add Award
          </AddItemButton>
          <div className="flex-1 min-w-[120px]">
            <ImportFromProfileDialog
              profile={profile}
              type="awards"
              onImport={(data) => handleImportFromProfile(data as Award[])}
              buttonClassName="h-9 w-full mb-0 text-sm border-dashed border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors duration-150"
            />
          </div>
        </div>
      </div>

      {awards.map((award, index) => (
        <Card
          key={index}
          className="bg-white border border-gray-200 rounded-lg shadow-sm"
        >
          <CardContent className="p-3 space-y-3">
            <div className="flex items-end gap-2">
              <FormField label="Award Title" className="flex-1">
                <Input
                  value={award.title}
                  onChange={(e) => updateAward(index, "title", e.target.value)}
                  className={cn(FORM_INPUT_CLASS, "font-medium")}
                  placeholder="Best Paper Award"
                />
              </FormField>
              <div className="flex flex-col gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => moveAward(index, "up")}
                  disabled={index === 0}
                  className="h-4 w-7 p-0 rounded text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-20 disabled:pointer-events-none"
                >
                  <ChevronUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => moveAward(index, "down")}
                  disabled={index === awards.length - 1}
                  className="h-4 w-7 p-0 rounded text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-20 disabled:pointer-events-none"
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </div>
              <DeleteButton onClick={() => removeAward(index)} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <FormField label="Issuer" hint="opt">
                <Input
                  value={award.issuer || ""}
                  onChange={(e) => updateAward(index, "issuer", e.target.value)}
                  className={FORM_INPUT_CLASS}
                  placeholder="Issuing Organization"
                />
              </FormField>
              <FormField label="Date" hint="opt">
                <Input
                  value={award.date || ""}
                  onChange={(e) => updateAward(index, "date", e.target.value)}
                  className={FORM_INPUT_CLASS}
                  placeholder="May 2023"
                />
              </FormField>
            </div>

            <FormField label="Description" hint="opt">
              <Input
                value={award.description || ""}
                onChange={(e) =>
                  updateAward(index, "description", e.target.value)
                }
                className={FORM_INPUT_CLASS}
                placeholder="Brief description of the award"
              />
            </FormField>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
