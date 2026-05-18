"use client";

import { Award } from "@/lib/types";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FormField, FORM_INPUT_CLASS } from "@/components/ui/form-field";
import { DeleteButton } from "@/components/ui/delete-button";
import { AddItemButton } from "@/components/ui/add-item-button";

interface ProfileAwardsFormProps {
  awards: Award[];
  onChange: (awards: Award[]) => void;
}

export function ProfileAwardsForm({
  awards,
  onChange,
}: ProfileAwardsFormProps) {
  const addAward = () => {
    onChange([...awards, { title: "", issuer: "", date: "", description: "" }]);
  };

  const updateAward = (index: number, field: keyof Award, value: string) => {
    const updated = [...awards];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeAward = (index: number) => {
    onChange(awards.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <Accordion
        type="multiple"
        className="space-y-2"
        defaultValue={awards.map((_, i) => `award-${i}`)}
      >
        {awards.map((award, index) => (
          <AccordionItem
            key={index}
            value={`award-${index}`}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors duration-150"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50 transition-colors duration-150">
              <div className="flex items-center justify-between gap-3 flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-900 truncate">
                  {award.title || "New Award"}
                  {award.issuer && (
                    <span className="font-normal text-gray-500 ml-1.5 text-xs">
                      by {award.issuer}
                    </span>
                  )}
                </span>
                {award.date && (
                  <span className="text-xs text-gray-400 shrink-0 mr-2">
                    {award.date}
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="px-4 pb-4 pt-3 space-y-4 border-t border-gray-100">
                <div className="flex items-end gap-2">
                  <FormField label="Award Title" className="flex-1">
                    <Input
                      value={award.title}
                      onChange={(e) =>
                        updateAward(index, "title", e.target.value)
                      }
                      className={FORM_INPUT_CLASS}
                      placeholder="Best Paper Award"
                    />
                  </FormField>
                  <DeleteButton onClick={() => removeAward(index)} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField label="Issuer" hint="Optional">
                    <Input
                      value={award.issuer || ""}
                      onChange={(e) =>
                        updateAward(index, "issuer", e.target.value)
                      }
                      className={FORM_INPUT_CLASS}
                      placeholder="Issuing Organization"
                    />
                  </FormField>
                  <FormField label="Date" hint="Optional">
                    <Input
                      value={award.date || ""}
                      onChange={(e) =>
                        updateAward(index, "date", e.target.value)
                      }
                      className={FORM_INPUT_CLASS}
                      placeholder="May 2023"
                    />
                  </FormField>
                </div>

                <FormField label="Description" hint="Optional">
                  <Input
                    value={award.description || ""}
                    onChange={(e) =>
                      updateAward(index, "description", e.target.value)
                    }
                    className={FORM_INPUT_CLASS}
                    placeholder="Brief description of the award"
                  />
                </FormField>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <AddItemButton onClick={addAward} className="w-full">
        Add Award
      </AddItemButton>
    </div>
  );
}
