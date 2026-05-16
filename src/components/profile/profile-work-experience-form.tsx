"use client";

import { WorkExperience } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import React from "react";

interface ProfileWorkExperienceFormProps {
  experiences: WorkExperience[];
  onChange: (experiences: WorkExperience[]) => void;
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
                {/* Position row with delete */}
                <div className="flex items-end gap-2">
                  <Field label="Position">
                    <Input
                      value={exp.position}
                      onChange={(e) =>
                        updateExperience(index, "position", e.target.value)
                      }
                      className={inputClass}
                      placeholder="Position Title"
                    />
                  </Field>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExperience(index)}
                    className="h-8 w-8 shrink-0 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors duration-150"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <Field label="Company">
                  <Input
                    value={exp.company}
                    onChange={(e) =>
                      updateExperience(index, "company", e.target.value)
                    }
                    className={inputClass}
                    placeholder="Company Name"
                  />
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Field label="Date">
                    <Input
                      value={exp.date}
                      onChange={(e) =>
                        updateExperience(index, "date", e.target.value)
                      }
                      className={inputClass}
                      placeholder="Jan 2023 – Present"
                    />
                  </Field>
                  <div className="md:col-span-2">
                    <Field label="Location">
                      <Input
                        value={exp.location}
                        onChange={(e) =>
                          updateExperience(index, "location", e.target.value)
                        }
                        className={inputClass}
                        placeholder="Vancouver, BC"
                      />
                    </Field>
                  </div>
                </div>

                <Field label="Technologies" hint="Separate with commas">
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
                    className={inputClass}
                  />
                </Field>

                {/* Description bullets */}
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
                          className={inputClass + " flex-1"}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const updated = [...experiences];
                            updated[index].description = updated[
                              index
                            ].description.filter((_, i) => i !== descIndex);
                            onChange(updated);
                          }}
                          className="h-8 w-8 shrink-0 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors duration-150"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
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

      <Button
        variant="outline"
        onClick={addExperience}
        className="w-full h-9 border-dashed border-gray-200 text-gray-400 text-sm hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors duration-150"
      >
        <Plus className="h-3.5 w-3.5 mr-1.5" />
        Add Work Experience
      </Button>
    </div>
  );
}
