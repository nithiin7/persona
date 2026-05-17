"use client";

import { Volunteer, Profile } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { ImportFromProfileDialog } from "../../management/dialogs/import-from-profile-dialog";
import React from "react";

interface VolunteerFormProps {
  volunteer: Volunteer[];
  onChange: (volunteer: Volunteer[]) => void;
  profile: Profile;
}

export function VolunteerForm({
  volunteer,
  onChange,
  profile,
}: VolunteerFormProps) {
  const addEntry = () => {
    onChange([
      { organization: "", role: "", location: "", date: "", description: [] },
      ...volunteer,
    ]);
  };

  const updateEntry = (
    index: number,
    field: keyof Volunteer,
    value: string | string[]
  ) => {
    const updated = [...volunteer];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeEntry = (index: number) => {
    onChange(volunteer.filter((_, i) => i !== index));
  };

  const handleImportFromProfile = (imported: Volunteer[]) => {
    onChange([...imported, ...volunteer]);
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
            onClick={addEntry}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5 shrink-0" />
            Add Volunteer Experience
          </Button>
          <div className="flex-1 min-w-[120px]">
            <ImportFromProfileDialog
              profile={profile}
              type="volunteer"
              onImport={(data) => handleImportFromProfile(data as Volunteer[])}
              buttonClassName="h-9 w-full mb-0 text-sm border-dashed border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors duration-150"
            />
          </div>
        </div>
      </div>

      {volunteer.map((entry, index) => (
        <Card
          key={index}
          className="bg-white border border-gray-200 rounded-lg shadow-sm"
        >
          <CardContent className="p-3 space-y-3">
            <div className="flex items-end gap-2">
              <div className="space-y-1 flex-1">
                <label className="text-xs font-medium text-gray-500">
                  Organization
                </label>
                <Input
                  value={entry.organization}
                  onChange={(e) =>
                    updateEntry(index, "organization", e.target.value)
                  }
                  className={inputClass + " font-medium"}
                  placeholder="Organization Name"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeEntry(index)}
                className="h-8 w-8 shrink-0 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors duration-150"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Role</label>
              <Input
                value={entry.role}
                onChange={(e) => updateEntry(index, "role", e.target.value)}
                className={inputClass}
                placeholder="Volunteer Role / Title"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">
                  Date <span className="text-gray-400">(opt)</span>
                </label>
                <Input
                  value={entry.date || ""}
                  onChange={(e) => updateEntry(index, "date", e.target.value)}
                  className={inputClass}
                  placeholder="Jan 2022 – Present"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">
                  Location <span className="text-gray-400">(opt)</span>
                </label>
                <Input
                  value={entry.location || ""}
                  onChange={(e) =>
                    updateEntry(index, "location", e.target.value)
                  }
                  className={inputClass}
                  placeholder="City, State"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">
                Description{" "}
                <span className="text-gray-400">
                  (opt, one bullet per line)
                </span>
              </label>
              <Textarea
                value={(entry.description || []).join("\n")}
                onChange={(e) =>
                  updateEntry(
                    index,
                    "description",
                    e.target.value ? e.target.value.split("\n") : []
                  )
                }
                className="border-gray-200 bg-white placeholder:text-gray-400 text-sm focus:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[72px] resize-none"
                placeholder="Led weekly food drives serving 200+ families&#10;Coordinated a team of 15 volunteers"
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
