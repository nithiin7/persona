"use client";

import { Skill } from "@/lib/types";
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

interface ProfileSkillsFormProps {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
}

const inputClass =
  "h-8 border-gray-200 bg-white placeholder:text-gray-400 text-sm focus:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0";

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
                {/* Category + delete */}
                <div className="flex items-end gap-2">
                  <div className="space-y-1.5 flex-1">
                    <label className="text-xs font-medium text-gray-500">
                      Category
                    </label>
                    <Input
                      value={skill.category}
                      onChange={(e) =>
                        updateSkill(index, "category", e.target.value)
                      }
                      className={inputClass}
                      placeholder="e.g., Programming Languages, Frameworks, Tools"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSkill(index)}
                    className="h-8 w-8 shrink-0 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors duration-150"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <label className="text-xs font-medium text-gray-500">
                      Skills
                    </label>
                    <span className="text-[10px] text-gray-400">
                      Separate with commas
                    </span>
                  </div>
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
                    className={inputClass}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Button
        variant="outline"
        onClick={addSkill}
        className="w-full h-9 border-dashed border-gray-200 text-gray-400 text-sm hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors duration-150"
      >
        <Plus className="h-3.5 w-3.5 mr-1.5" />
        Add Skill Category
      </Button>
    </div>
  );
}
