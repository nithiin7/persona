"use client";

import { Skill, Profile } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ImportFromProfileDialog } from "../../management/dialogs/import-from-profile-dialog";
import { useState, KeyboardEvent } from "react";

interface SkillsFormProps {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
  profile: Profile;
}

export function SkillsForm({ skills, onChange, profile }: SkillsFormProps) {
  const [newSkills, setNewSkills] = useState<{ [key: number]: string }>({});

  const addSkillCategory = () => {
    onChange([
      {
        category: "",
        items: [],
      },
      ...skills,
    ]);
  };

  const updateSkillCategory = (
    index: number,
    field: keyof Skill,
    value: string | string[]
  ) => {
    const updated = [...skills];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeSkillCategory = (index: number) => {
    onChange(skills.filter((_, i) => i !== index));
  };

  const addSkill = (categoryIndex: number) => {
    const skillToAdd = newSkills[categoryIndex]?.trim();
    if (!skillToAdd) return;

    const updated = [...skills];
    const currentItems = updated[categoryIndex].items || [];
    if (!currentItems.includes(skillToAdd)) {
      updated[categoryIndex] = {
        ...updated[categoryIndex],
        items: [...currentItems, skillToAdd],
      };
      onChange(updated);
    }
    setNewSkills({ ...newSkills, [categoryIndex]: "" });
  };

  const handleKeyPress = (
    e: KeyboardEvent<HTMLInputElement>,
    categoryIndex: number
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill(categoryIndex);
    }
  };

  const removeSkill = (categoryIndex: number, skillIndex: number) => {
    const updated = skills.map((skill, idx) => {
      if (idx === categoryIndex) {
        return {
          ...skill,
          items: skill.items.filter((_, i) => i !== skillIndex),
        };
      }
      return skill;
    });
    onChange(updated);
  };

  const handleImportFromProfile = (importedSkills: Skill[]) => {
    onChange([...importedSkills, ...skills]);
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="@container">
        <div
          className={cn(
            "flex flex-col @[400px]:flex-row gap-2",
            "transition-all duration-300 ease-in-out"
          )}
        >
          <Button
            variant="outline"
            className="flex-1 h-9 min-w-[120px] border-dashed border-gray-200 text-gray-400 text-sm hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors duration-150"
            onClick={addSkillCategory}
          >
            <Plus className="h-4 w-4 mr-2 shrink-0" />
            Add Skill Category
          </Button>

          <ImportFromProfileDialog<Skill>
            profile={profile}
            onImport={handleImportFromProfile}
            type="skills"
            buttonClassName="flex-1 mb-0 h-9 min-w-[120px] text-sm border-dashed border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors duration-150"
          />
        </div>
      </div>

      {skills.map((skill, index) => (
        <Card
          key={index}
          className="bg-white border border-gray-200 rounded-lg shadow-sm"
        >
          <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
            <div className="space-y-2 sm:space-y-3">
              {/* Category Name and Delete Button Row */}
              <div className="flex items-end gap-2">
                <div className="space-y-1 flex-1">
                  <label className="text-xs font-medium text-gray-500">
                    Category
                  </label>
                  <Input
                    value={skill.category}
                    onChange={(e) =>
                      updateSkillCategory(index, "category", e.target.value)
                    }
                    className="h-8 border-gray-200 bg-white placeholder:text-gray-400 text-sm font-medium focus:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                    placeholder="Category Name"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSkillCategory(index)}
                  className="h-8 w-8 shrink-0 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors duration-150"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Skills Display */}
              <div className="space-y-2 sm:space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {skill.items.map((item, skillIndex) => (
                    <Badge
                      key={skillIndex}
                      variant="secondary"
                      className="bg-gray-100 text-gray-700 border border-gray-200 py-0.5 text-xs cursor-default"
                    >
                      {item}
                      <button
                        onClick={() => removeSkill(index, skillIndex)}
                        className="ml-1.5 hover:text-red-500 opacity-50 hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>

                {/* New Skill Input */}
                <div className="relative group flex gap-2">
                  <Input
                    value={newSkills[index] || ""}
                    onChange={(e) =>
                      setNewSkills({ ...newSkills, [index]: e.target.value })
                    }
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    className="h-8 border-gray-200 bg-white placeholder:text-gray-400 text-sm focus:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                    placeholder="Type a skill and press Enter or click +"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addSkill(index)}
                    className="h-8 w-9 border border-gray-200 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <label className="text-xs font-medium text-gray-500 block mb-1">
                    Add Skill
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
