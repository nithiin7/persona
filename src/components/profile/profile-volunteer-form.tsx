"use client";

import { Volunteer } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FormField, FORM_INPUT_CLASS } from "@/components/ui/form-field";
import { DeleteButton } from "@/components/ui/delete-button";
import { AddItemButton } from "@/components/ui/add-item-button";

interface ProfileVolunteerFormProps {
  volunteer: Volunteer[];
  onChange: (volunteer: Volunteer[]) => void;
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
                  <FormField label="Organization" className="flex-1">
                    <Input
                      value={entry.organization}
                      onChange={(e) =>
                        updateEntry(index, "organization", e.target.value)
                      }
                      className={FORM_INPUT_CLASS}
                      placeholder="Organization Name"
                    />
                  </FormField>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField label="Date" hint="Optional">
                    <Input
                      value={entry.date || ""}
                      onChange={(e) =>
                        updateEntry(index, "date", e.target.value)
                      }
                      className={FORM_INPUT_CLASS}
                      placeholder="Jan 2022 – Present"
                    />
                  </FormField>
                  <FormField label="Location" hint="Optional">
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

                <FormField
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
                </FormField>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <AddItemButton onClick={addEntry} className="w-full">
        Add Volunteer Experience
      </AddItemButton>
    </div>
  );
}
