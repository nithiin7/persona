"use client";

import { Education } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ProfileEducationFormProps {
  education: Education[];
  onChange: (education: Education[]) => void;
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

export function ProfileEducationForm({
  education,
  onChange,
}: ProfileEducationFormProps) {
  const addEducation = () => {
    onChange([
      ...education,
      {
        school: "",
        degree: "",
        field: "",
        location: "",
        date: "",
        gpa: undefined,
        achievements: [],
      },
    ]);
  };

  const updateEducation = (
    index: number,
    field: keyof Education,
    value: Education[typeof field]
  ) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeEducation = (index: number) => {
    onChange(education.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <Accordion
        type="multiple"
        className="space-y-2"
        defaultValue={education.map((_, i) => `education-${i}`)}
      >
        {education.map((edu, index) => (
          <AccordionItem
            key={index}
            value={`education-${index}`}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors duration-150"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50 transition-colors duration-150">
              <div className="flex items-center justify-between gap-3 flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-900 truncate">
                  {edu.school || "Untitled Institution"}
                  {edu.degree && (
                    <span className="font-normal text-gray-500 ml-1.5">
                      · {edu.degree}
                    </span>
                  )}
                </span>
                {edu.date && (
                  <span className="text-xs text-gray-400 shrink-0 mr-2">
                    {edu.date}
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="px-4 pb-4 pt-3 space-y-4 border-t border-gray-100">
                {/* School + delete */}
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Field label="Institution">
                      <Input
                        value={edu.school}
                        onChange={(e) =>
                          updateEducation(index, "school", e.target.value)
                        }
                        className={inputClass}
                        placeholder="University Name"
                      />
                    </Field>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEducation(index)}
                    className="h-8 w-8 shrink-0 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors duration-150"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <Field label="Location">
                  <Input
                    value={edu.location}
                    onChange={(e) =>
                      updateEducation(index, "location", e.target.value)
                    }
                    className={inputClass}
                    placeholder="City, Country"
                  />
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Degree">
                    <Input
                      value={edu.degree}
                      onChange={(e) =>
                        updateEducation(index, "degree", e.target.value)
                      }
                      className={inputClass}
                      placeholder="Bachelor's, Master's…"
                    />
                  </Field>
                  <Field label="Field of Study">
                    <Input
                      value={edu.field}
                      onChange={(e) =>
                        updateEducation(index, "field", e.target.value)
                      }
                      className={inputClass}
                      placeholder="Computer Science"
                    />
                  </Field>
                  <Field label="Date">
                    <Input
                      value={edu.date}
                      onChange={(e) =>
                        updateEducation(index, "date", e.target.value)
                      }
                      className={inputClass}
                      placeholder="2019 – 2023"
                    />
                  </Field>
                  <Field label="GPA" hint="Optional">
                    <Input
                      type="text"
                      value={edu.gpa || ""}
                      onChange={(e) =>
                        updateEducation(
                          index,
                          "gpa",
                          e.target.value || undefined
                        )
                      }
                      className={inputClass}
                      placeholder="3.9"
                    />
                  </Field>
                </div>

                <Field
                  label="Achievements &amp; Activities"
                  hint="One per line"
                >
                  <Textarea
                    value={edu.achievements?.join("\n")}
                    onChange={(e) =>
                      updateEducation(
                        index,
                        "achievements",
                        e.target.value.split("\n").filter(Boolean)
                      )
                    }
                    placeholder={
                      "Dean's List 2020–2021\nPresident of CS Club\nFirst place, Hackathon 2022"
                    }
                    className="min-h-[90px] border-gray-200 bg-white placeholder:text-gray-400 text-sm focus:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                  />
                </Field>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Button
        variant="outline"
        onClick={addEducation}
        className="w-full h-9 border-dashed border-gray-200 text-gray-400 text-sm hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors duration-150"
      >
        <Plus className="h-3.5 w-3.5 mr-1.5" />
        Add Education
      </Button>
    </div>
  );
}
