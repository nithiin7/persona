"use client";

import { Skill } from "@/lib/types";
import { Input } from "@/components/ui/input";
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

interface ProfileSkillsFormProps {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
}

export function ProfileSkillsForm({
  skills,
  onChange,
}: ProfileSkillsFormProps) {
  const addSkill = () => {
    onChange([...skills, { category: "", items: [] }]);
  };

  const updateSkill = (
    index: number,
    field: keyof Skill,
    value: Skill[typeof field]
  ) => {
    const updated = [...skills];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeSkill = (index: number) => {
    onChange(skills.filter((_, i) => i !== index));
  };

  const [skillInputs, setSkillInputs] = React.useState<{
    [key: number]: string;
  }>(Object.fromEntries(skills.map((s, i) => [i, s.items?.join(", ") || ""])));

  React.useEffect(() => {
    setSkillInputs(
      Object.fromEntries(skills.map((s, i) => [i, s.items?.join(", ") || ""]))
    );
  }, [skills]);

  return (
    <div className="space-y-2">
      <Accordion
        type="multiple"
        className="space-y-2"
        defaultValue={skills.map((_, i) => `skill-${i}`)}
      >
        {skills.map((skill, index) => (
          <AccordionItem
            key={index}
            value={`skill-${index}`}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors duration-150"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50 transition-colors duration-150">
              <div className="flex items-center justify-between gap-3 flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-900 truncate">
                  {skill.category || "New Skill Category"}
                </span>
                {skill.items && skill.items.length > 0 && (
                  <span className="text-xs text-gray-400 truncate max-w-[220px] mr-2">
                    {skill.items.join(", ")}
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="px-4 pb-4 pt-3 space-y-4 border-t border-gray-100">
                <div className="flex items-end gap-2">
                  <FormField label="Category" className="flex-1">
                    <Input
                      value={skill.category}
                      onChange={(e) =>
                        updateSkill(index, "category", e.target.value)
                      }
                      className={FORM_INPUT_CLASS}
                      placeholder="e.g., Programming Languages, Frameworks, Tools"
                    />
                  </FormField>
                  <DeleteButton onClick={() => removeSkill(index)} />
                </div>

                <FormField label="Skills" hint="Separate with commas">
                  <Input
                    value={skillInputs[index] || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSkillInputs((prev) => ({ ...prev, [index]: val }));
                      const items = val
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean);
                      updateSkill(index, "items", items);
                    }}
                    onBlur={(e) => {
                      const items = e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean);
                      updateSkill(index, "items", items);
                      setSkillInputs((prev) => ({
                        ...prev,
                        [index]: items.join(", "),
                      }));
                    }}
                    placeholder="TypeScript, React, Node.js, AWS"
                    className={FORM_INPUT_CLASS}
                  />
                </FormField>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <AddItemButton onClick={addSkill} className="w-full">
        Add Skill Category
      </AddItemButton>
    </div>
  );
}
