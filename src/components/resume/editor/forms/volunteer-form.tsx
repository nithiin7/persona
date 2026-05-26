"use client";

import { Volunteer, Profile } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImportFromProfileDialog } from "../../management/dialogs/import-from-profile-dialog";
import { FormField, FORM_INPUT_CLASS } from "@/components/ui/form-field";
import { DeleteButton } from "@/components/ui/delete-button";
import { AddItemButton } from "@/components/ui/add-item-button";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";

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

  const moveEntry = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= volunteer.length) return;
    const updated = [...volunteer];
    [updated[index], updated[targetIndex]] = [
      updated[targetIndex],
      updated[index],
    ];
    onChange(updated);
  };

  const handleImportFromProfile = (imported: Volunteer[]) => {
    onChange([...imported, ...volunteer]);
  };

  return (
    <div className="space-y-2">
      <div className="@container">
        <div className="flex flex-col @[400px]:flex-row gap-2">
          <AddItemButton onClick={addEntry} className="flex-1 min-w-[120px]">
            Add Volunteer Experience
          </AddItemButton>
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
              <FormField label="Organization" className="flex-1">
                <Input
                  value={entry.organization}
                  onChange={(e) =>
                    updateEntry(index, "organization", e.target.value)
                  }
                  className={cn(FORM_INPUT_CLASS, "font-medium")}
                  placeholder="Organization Name"
                />
              </FormField>
              <div className="flex flex-col gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => moveEntry(index, "up")}
                  disabled={index === 0}
                  className="h-4 w-7 p-0 rounded text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-20 disabled:pointer-events-none"
                >
                  <ChevronUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => moveEntry(index, "down")}
                  disabled={index === volunteer.length - 1}
                  className="h-4 w-7 p-0 rounded text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-20 disabled:pointer-events-none"
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </div>
              <DeleteButton onClick={() => removeEntry(index)} />
            </div>

            <FormField label="Role">
              <Input
                value={entry.role}
                onChange={(e) => updateEntry(index, "role", e.target.value)}
                className={FORM_INPUT_CLASS}
                placeholder="Volunteer Role / Title"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-2">
              <FormField label="Date" hint="opt">
                <Input
                  value={entry.date || ""}
                  onChange={(e) => updateEntry(index, "date", e.target.value)}
                  className={FORM_INPUT_CLASS}
                  placeholder="Jan 2022 – Present"
                />
              </FormField>
              <FormField label="Location" hint="opt">
                <Input
                  value={entry.location || ""}
                  onChange={(e) =>
                    updateEntry(index, "location", e.target.value)
                  }
                  className={FORM_INPUT_CLASS}
                  placeholder="City, State"
                />
              </FormField>
            </div>

            <FormField label="Description" hint="opt, one bullet per line">
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
            </FormField>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
