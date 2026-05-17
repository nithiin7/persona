"use client";

import { Volunteer } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ProfileVolunteerFormProps {
  volunteer: Volunteer[];
  onChange: (volunteer: Volunteer[]) => void;
}

const inputClass =
  "h-8 border-gray-200 bg-white placeholder:text-gray-400 text-sm focus:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0";

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-xs font-medium text-gray-500">{label}</label>
        {hint && <span className="text-[10px] text-gray-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export function ProfileVolunteerForm({
  volunteer,
  onChange,
}: ProfileVolunteerFormProps) {
  const addEntry = () => {
    onChange([
      ...volunteer,
      { organization: "", role: "", location: "", date: "", description: [] },
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

  return (
    <div className="space-y-2">
      <Accordion
        type="multiple"
        className="space-y-2"
        defaultValue={volunteer.map((_, i) => `vol-${i}`)}
      >
        {volunteer.map((entry, index) => (
          <AccordionItem
            key={index}
            value={`vol-${index}`}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors duration-150"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50 transition-colors duration-150">
              <div className="flex items-center justify-between gap-3 flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-900 truncate">
                  {entry.organization || "New Volunteer Experience"}
                  {entry.role && (
                    <span className="font-normal text-gray-500 ml-1.5 text-xs">
                      · {entry.role}
                    </span>
                  )}
                </span>
                {entry.date && (
                  <span className="text-xs text-gray-400 shrink-0 mr-2">
                    {entry.date}
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="px-4 pb-4 pt-3 space-y-4 border-t border-gray-100">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Field label="Organization">
                      <Input
                        value={entry.organization}
                        onChange={(e) =>
                          updateEntry(index, "organization", e.target.value)
                        }
                        className={inputClass}
                        placeholder="Organization Name"
                      />
                    </Field>
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

                <Field label="Role">
                  <Input
                    value={entry.role}
                    onChange={(e) => updateEntry(index, "role", e.target.value)}
                    className={inputClass}
                    placeholder="Volunteer Role / Title"
                  />
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Date" hint="Optional">
                    <Input
                      value={entry.date || ""}
                      onChange={(e) =>
                        updateEntry(index, "date", e.target.value)
                      }
                      className={inputClass}
                      placeholder="Jan 2022 – Present"
                    />
                  </Field>
                  <Field label="Location" hint="Optional">
                    <Input
                      value={entry.location || ""}
                      onChange={(e) =>
                        updateEntry(index, "location", e.target.value)
                      }
                      className={inputClass}
                      placeholder="City, State"
                    />
                  </Field>
                </div>

                <Field
                  label="Description"
                  hint="Optional — one bullet per line"
                >
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
                </Field>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Button
        variant="outline"
        onClick={addEntry}
        className="w-full h-9 border-dashed border-gray-200 text-gray-400 text-sm hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors duration-150"
      >
        <Plus className="h-3.5 w-3.5 mr-1.5" />
        Add Volunteer Experience
      </Button>
    </div>
  );
}
