"use client";

import { Education } from "@/lib/types";
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

interface ProfileEducationFormProps {
  education: Education[];
  onChange: (education: Education[]) => void;
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
                <div className="flex items-end gap-2">
                  <FormField label="Institution" className="flex-1">
                    <Input
                      value={edu.school}
                      onChange={(e) =>
                        updateEducation(index, "school", e.target.value)
                      }
                      className={FORM_INPUT_CLASS}
                      placeholder="University Name"
                    />
                  </FormField>
                  <DeleteButton onClick={() => removeEducation(index)} />
                </div>

                <FormField label="Location">
                  <Input
                    value={edu.location}
                    onChange={(e) =>
                      updateEducation(index, "location", e.target.value)
                    }
                    className={FORM_INPUT_CLASS}
                    placeholder="City, Country"
                  />
                </FormField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField label="Degree">
                    <Input
                      value={edu.degree}
                      onChange={(e) =>
                        updateEducation(index, "degree", e.target.value)
                      }
                      className={FORM_INPUT_CLASS}
                      placeholder="Bachelor's, Master's…"
                    />
                  </FormField>
                  <FormField label="Field of Study">
                    <Input
                      value={edu.field}
                      onChange={(e) =>
                        updateEducation(index, "field", e.target.value)
                      }
                      className={FORM_INPUT_CLASS}
                      placeholder="Computer Science"
                    />
                  </FormField>
                  <FormField label="Date">
                    <Input
                      value={edu.date}
                      onChange={(e) =>
                        updateEducation(index, "date", e.target.value)
                      }
                      className={FORM_INPUT_CLASS}
                      placeholder="2019 – 2023"
                    />
                  </FormField>
                  <FormField label="GPA" hint="Optional">
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
                      className={FORM_INPUT_CLASS}
                      placeholder="3.9"
                    />
                  </FormField>
                </div>

                <FormField
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
                </FormField>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <AddItemButton onClick={addEducation} className="w-full">
        Add Education
      </AddItemButton>
    </div>
  );
}
