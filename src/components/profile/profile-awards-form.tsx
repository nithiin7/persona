"use client";

import { Award } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ProfileAwardsFormProps {
  awards: Award[];
  onChange: (awards: Award[]) => void;
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
                  <div className="flex-1">
                    <Field label="Award Title">
                      <Input
                        value={award.title}
                        onChange={(e) =>
                          updateAward(index, "title", e.target.value)
                        }
                        className={inputClass}
                        placeholder="Best Paper Award"
                      />
                    </Field>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Issuer" hint="Optional">
                    <Input
                      value={award.issuer || ""}
                      onChange={(e) =>
                        updateAward(index, "issuer", e.target.value)
                      }
                      className={inputClass}
                      placeholder="Issuing Organization"
                    />
                  </Field>
                  <Field label="Date" hint="Optional">
                    <Input
                      value={award.date || ""}
                      onChange={(e) =>
                        updateAward(index, "date", e.target.value)
                      }
                      className={inputClass}
                      placeholder="May 2023"
                    />
                  </Field>
                </div>

                <Field label="Description" hint="Optional">
                  <Input
                    value={award.description || ""}
                    onChange={(e) =>
                      updateAward(index, "description", e.target.value)
                    }
                    className={inputClass}
                    placeholder="Brief description of the award"
                  />
                </Field>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Button
        variant="outline"
        onClick={addAward}
        className="w-full h-9 border-dashed border-gray-200 text-gray-400 text-sm hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors duration-150"
      >
        <Plus className="h-3.5 w-3.5 mr-1.5" />
        Add Award
      </Button>
    </div>
  );
}
