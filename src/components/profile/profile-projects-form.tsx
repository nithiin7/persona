"use client";

import { Project } from "@/lib/types";
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

interface ProfileProjectsFormProps {
  projects: Project[];
  onChange: (projects: Project[]) => void;
}

export function ProfileProjectsForm({
  projects,
  onChange,
}: ProfileProjectsFormProps) {
  const [techInputs, setTechInputs] = React.useState<{ [key: number]: string }>(
    Object.fromEntries(
      projects.map((p, i) => [i, p.technologies?.join(", ") || ""])
    )
  );

  React.useEffect(() => {
    setTechInputs(
      Object.fromEntries(
        projects.map((p, i) => [i, p.technologies?.join(", ") || ""])
      )
    );
  }, [projects]);

  const addProject = () => {
    onChange([
      ...projects,
      {
        name: "",
        description: [],
        technologies: [],
        url: "",
        github_url: "",
        date: "",
      },
    ]);
  };

  const updateProject = (
    index: number,
    field: keyof Project,
    value: string | string[]
  ) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeProject = (index: number) => {
    onChange(projects.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <Accordion
        type="multiple"
        className="space-y-2"
        defaultValue={projects.map((_, i) => `project-${i}`)}
      >
        {projects.map((project, index) => (
          <AccordionItem
            key={index}
            value={`project-${index}`}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors duration-150"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50 transition-colors duration-150">
              <div className="flex items-center justify-between gap-3 flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-900 truncate">
                  {project.name || "Untitled Project"}
                </span>
                {project.date && (
                  <span className="text-xs text-gray-400 shrink-0 mr-2">
                    {project.date}
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="px-4 pb-4 pt-3 space-y-4 border-t border-gray-100">
                <div className="flex items-end gap-2">
                  <FormField label="Project Name" className="flex-1">
                    <Input
                      value={project.name}
                      onChange={(e) =>
                        updateProject(index, "name", e.target.value)
                      }
                      className={FORM_INPUT_CLASS}
                      placeholder="Project Name"
                    />
                  </FormField>
                  <DeleteButton onClick={() => removeProject(index)} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField label="Live URL" hint="Optional">
                    <Input
                      type="url"
                      value={project.url || ""}
                      onChange={(e) =>
                        updateProject(index, "url", e.target.value)
                      }
                      className={FORM_INPUT_CLASS}
                      placeholder="https://your-project.com"
                    />
                  </FormField>
                  <FormField label="GitHub URL" hint="Optional">
                    <Input
                      type="url"
                      value={project.github_url || ""}
                      onChange={(e) =>
                        updateProject(index, "github_url", e.target.value)
                      }
                      className={FORM_INPUT_CLASS}
                      placeholder="https://github.com/user/repo"
                    />
                  </FormField>
                </div>

                <FormField label="Date" hint="Optional">
                  <Input
                    value={project.date || ""}
                    onChange={(e) =>
                      updateProject(index, "date", e.target.value)
                    }
                    className={FORM_INPUT_CLASS}
                    placeholder="Jan 2023 – Present"
                  />
                </FormField>

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
                      updateProject(index, "technologies", techs);
                    }}
                    onBlur={(e) => {
                      const techs = e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean);
                      updateProject(index, "technologies", techs);
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
                      Description
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const updated = [...projects];
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
                    {project.description.map((desc, descIndex) => (
                      <div key={descIndex} className="flex gap-2 items-center">
                        <Input
                          value={desc}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[index].description[descIndex] =
                              e.target.value;
                            onChange(updated);
                          }}
                          placeholder="Describe a key feature or achievement…"
                          className={cn(FORM_INPUT_CLASS, "flex-1")}
                        />
                        <DeleteButton
                          onClick={() => {
                            const updated = [...projects];
                            updated[index].description = updated[
                              index
                            ].description.filter((_, i) => i !== descIndex);
                            onChange(updated);
                          }}
                        />
                      </div>
                    ))}
                    {project.description.length === 0 && (
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

      <AddItemButton onClick={addProject} className="w-full">
        Add Project
      </AddItemButton>
    </div>
  );
}
