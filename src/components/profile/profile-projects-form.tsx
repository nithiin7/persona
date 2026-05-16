"use client";

import { Project } from "@/lib/types";
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

interface ProfileProjectsFormProps {
  projects: Project[];
  onChange: (projects: Project[]) => void;
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
                {/* Name + delete */}
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Field label="Project Name">
                      <Input
                        value={project.name}
                        onChange={(e) =>
                          updateProject(index, "name", e.target.value)
                        }
                        className={inputClass}
                        placeholder="Project Name"
                      />
                    </Field>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeProject(index)}
                    className="h-8 w-8 shrink-0 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors duration-150"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Live URL" hint="Optional">
                    <Input
                      type="url"
                      value={project.url || ""}
                      onChange={(e) =>
                        updateProject(index, "url", e.target.value)
                      }
                      className={inputClass}
                      placeholder="https://your-project.com"
                    />
                  </Field>
                  <Field label="GitHub URL" hint="Optional">
                    <Input
                      type="url"
                      value={project.github_url || ""}
                      onChange={(e) =>
                        updateProject(index, "github_url", e.target.value)
                      }
                      className={inputClass}
                      placeholder="https://github.com/user/repo"
                    />
                  </Field>
                </div>

                <Field label="Date" hint="Optional">
                  <Input
                    value={project.date || ""}
                    onChange={(e) =>
                      updateProject(index, "date", e.target.value)
                    }
                    className={inputClass}
                    placeholder="Jan 2023 – Present"
                  />
                </Field>

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
                    className={inputClass}
                  />
                </Field>

                {/* Description bullets */}
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
                          className={inputClass + " flex-1"}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const updated = [...projects];
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

      <Button
        variant="outline"
        onClick={addProject}
        className="w-full h-9 border-dashed border-gray-200 text-gray-400 text-sm hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors duration-150"
      >
        <Plus className="h-3.5 w-3.5 mr-1.5" />
        Add Project
      </Button>
    </div>
  );
}
