"use client";

import { Award, Profile } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { ImportFromProfileDialog } from "../../management/dialogs/import-from-profile-dialog";
import React from "react";

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

  const handleImportFromProfile = (imported: Award[]) => {
    onChange([...imported, ...awards]);
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
            onClick={addAward}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5 shrink-0" />
            Add Award
          </Button>
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
              <div className="space-y-1 flex-1">
                <label className="text-xs font-medium text-gray-500">
                  Award Title
                </label>
                <Input
                  value={award.title}
                  onChange={(e) => updateAward(index, "title", e.target.value)}
                  className={inputClass + " font-medium"}
                  placeholder="Best Paper Award"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeAward(index)}
                className="h-8 w-8 shrink-0 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors duration-150"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">
                  Issuer <span className="text-gray-400">(opt)</span>
                </label>
                <Input
                  value={award.issuer || ""}
                  onChange={(e) => updateAward(index, "issuer", e.target.value)}
                  className={inputClass}
                  placeholder="Issuing Organization"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">
                  Date <span className="text-gray-400">(opt)</span>
                </label>
                <Input
                  value={award.date || ""}
                  onChange={(e) => updateAward(index, "date", e.target.value)}
                  className={inputClass}
                  placeholder="May 2023"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">
                Description <span className="text-gray-400">(opt)</span>
              </label>
              <Input
                value={award.description || ""}
                onChange={(e) =>
                  updateAward(index, "description", e.target.value)
                }
                className={inputClass}
                placeholder="Brief description of the award"
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
