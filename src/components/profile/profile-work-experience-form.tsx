"use client";

import { WorkExperience } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import React from "react";
import { FormField, FORM_INPUT_CLASS } from "@/components/ui/form-field";
import { DeleteButton } from "@/components/ui/delete-button";
import { AddItemButton } from "@/components/ui/add-item-button";
import { cn } from "@/lib/utils";

interface ProfileWorkExperienceFormProps {
  experiences: WorkExperience[];
  onChange: (experiences: WorkExperience[]) => void;
}

export function ProfileWorkExperienceForm({
  experiences,
  onChange,
}: ProfileWorkExperienceFormProps) {
  const addExperience = () => {
    onChange([
      ...experiences,
      {
        company: "",
        position: "",
        location: "",
        date: "",
        description: [],
        technologies: [],
      },
    ]);
  };

  const updateExperience = (
    index: number,
    field: keyof WorkExperience,
    value: string | string[]
  ) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeExperience = (index: number) => {
    onChange(experiences.filter((_, i) => i !== index));
  };

  const [techInputs, setTechInputs] = React.useState<{ [key: number]: string }>(
    Object.fromEntries(
      experiences.map((exp, i) => [i, exp.technologies?.join(", ") || ""])
    )
  );

  React.useEffect(() => {
    setTechInputs(
      Object.fromEntries(
        experiences.map((exp, i) => [i, exp.technologies?.join(", ") || ""])
      )
    );
  }, [experiences]);

  return (
    <div className="space-y-2">
      <Accordion
        type="multiple"
        className="space-y-2"
        defaultValue={experiences.map((_, i) => `experience-${i}`)}
      >
        {experiences.map((exp, index) => (
          <AccordionItem
            key={index}
            value={`experience-${index}`}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors duration-150"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50 transition-colors duration-150">
              <div className="flex items-center justify-between gap-3 flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-900 truncate">
                  {exp.company || "Untitled Company"}
                  {exp.position && (
                    <span className="font-normal text-gray-500 ml-1.5">
                      · {exp.position}
                    </span>
                  )}
                </span>
                {exp.date && (
                  <span className="text-xs text-gray-400 shrink-0 mr-2">
                    {exp.date}
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="px-4 pb-4 pt-3 space-y-4 border-t border-gray-100">
                <div className="flex items-end gap-2">
                  <FormField label="Position" className="flex-1">
                    <Input
                      value={exp.position}
                      onChange={(e) =>
                        updateExperience(index, "position", e.target.value)
                      }
                      className={FORM_INPUT_CLASS}
                      placeholder="Position Title"
                    />
                  </FormField>
                  <DeleteButton onClick={() => removeExperience(index)} />
                </div>

                <FormField label="Company">
                  <Input
                    value={exp.company}
                    onChange={(e) =>
                      updateExperience(index, "company", e.target.value)
                    }
                    className={FORM_INPUT_CLASS}
                    placeholder="Company Name"
                  />
                </FormField>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <FormField label="Date">
                    <Input
                      value={exp.date}
                      onChange={(e) =>
                        updateExperience(index, "date", e.target.value)
                      }
                      className={FORM_INPUT_CLASS}
                      placeholder="Jan 2023 – Present"
                    />
                  </FormField>
                  <FormField label="Location" className="md:col-span-2">
                    <Input
                      value={exp.location}
                      onChange={(e) =>
                        updateExperience(index, "location", e.target.value)
                      }
                      className={FORM_INPUT_CLASS}
                      placeholder="Vancouver, BC"
                    />
                  </FormField>
                </div>

                <FormField label="Technologies" hint="Separate with commas">
                  <Input
                    value={techInputs[index] || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTechInputs((prev) => ({ ...prev, [index]: val }));
                      const techs = val
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean);
                      updateExperience(index, "technologies", techs);
                    }}
                    onBlur={(e) => {
                      const techs = e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean);
                      updateExperience(index, "technologies", techs);
                      setTechInputs((prev) => ({
                        ...prev,
                        [index]: techs.join(", "),
                      }));
                    }}
                    placeholder="React, TypeScript, Node.js"
                    className={FORM_INPUT_CLASS}
                  />
                </FormField>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-500">
                      Responsibilities &amp; Achievements
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const updated = [...experiences];
                        updated[index].description = [
                          ...updated[index].description,
                          "",
                        ];
                        onChange(updated);
                      }}
                      className="h-6 px-2 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-150"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add bullet
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {exp.description.map((desc, descIndex) => (
                      <div key={descIndex} className="flex gap-2 items-center">
                        <Input
                          value={desc}
                          onChange={(e) => {
                            const updated = [...experiences];
                            updated[index].description[descIndex] =
                              e.target.value;
                            onChange(updated);
                          }}
                          placeholder="Start with a strong action verb…"
                          className={cn(FORM_INPUT_CLASS, "flex-1")}
                        />
                        <DeleteButton
                          onClick={() => {
                            const updated = [...experiences];
                            updated[index].description = updated[
                              index
                            ].description.filter((_, i) => i !== descIndex);
                            onChange(updated);
                          }}
                        />
                      </div>
                    ))}
                    {exp.description.length === 0 && (
                      <p className="text-xs text-gray-400 italic">
                        No bullets yet. Click &quot;Add bullet&quot; to start.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <AddItemButton onClick={addExperience} className="w-full">
        Add Work Experience
      </AddItemButton>
    </div>
  );
}
