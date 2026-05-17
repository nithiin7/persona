"use client";

import { Publication } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ProfilePublicationsFormProps {
  publications: Publication[];
  onChange: (publications: Publication[]) => void;
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

export function ProfilePublicationsForm({
  publications,
  onChange,
}: ProfilePublicationsFormProps) {
  const addPublication = () => {
    onChange([
      ...publications,
      { title: "", authors: "", venue: "", date: "", url: "" },
    ]);
  };

  const updatePublication = (
    index: number,
    field: keyof Publication,
    value: string
  ) => {
    const updated = [...publications];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removePublication = (index: number) => {
    onChange(publications.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <Accordion
        type="multiple"
        className="space-y-2"
        defaultValue={publications.map((_, i) => `pub-${i}`)}
      >
        {publications.map((pub, index) => (
          <AccordionItem
            key={index}
            value={`pub-${index}`}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors duration-150"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50 transition-colors duration-150">
              <div className="flex items-center justify-between gap-3 flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-900 truncate">
                  {pub.title || "New Publication"}
                  {pub.venue && (
                    <span className="font-normal text-gray-500 ml-1.5 text-xs">
                      · {pub.venue}
                    </span>
                  )}
                </span>
                {pub.date && (
                  <span className="text-xs text-gray-400 shrink-0 mr-2">
                    {pub.date}
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="px-4 pb-4 pt-3 space-y-4 border-t border-gray-100">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Field label="Title">
                      <Input
                        value={pub.title}
                        onChange={(e) =>
                          updatePublication(index, "title", e.target.value)
                        }
                        className={inputClass}
                        placeholder="Research Paper Title"
                      />
                    </Field>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePublication(index)}
                    className="h-8 w-8 shrink-0 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors duration-150"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <Field label="Authors" hint="Optional">
                  <Input
                    value={pub.authors || ""}
                    onChange={(e) =>
                      updatePublication(index, "authors", e.target.value)
                    }
                    className={inputClass}
                    placeholder="A. Smith, B. Jones, et al."
                  />
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Venue" hint="Optional">
                    <Input
                      value={pub.venue || ""}
                      onChange={(e) =>
                        updatePublication(index, "venue", e.target.value)
                      }
                      className={inputClass}
                      placeholder="Journal / Conference"
                    />
                  </Field>
                  <Field label="Date" hint="Optional">
                    <Input
                      value={pub.date || ""}
                      onChange={(e) =>
                        updatePublication(index, "date", e.target.value)
                      }
                      className={inputClass}
                      placeholder="June 2024"
                    />
                  </Field>
                </div>

                <Field label="URL" hint="Optional">
                  <Input
                    type="url"
                    value={pub.url || ""}
                    onChange={(e) =>
                      updatePublication(index, "url", e.target.value)
                    }
                    className={inputClass}
                    placeholder="https://doi.org/…"
                  />
                </Field>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Button
        variant="outline"
        onClick={addPublication}
        className="w-full h-9 border-dashed border-gray-200 text-gray-400 text-sm hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors duration-150"
      >
        <Plus className="h-3.5 w-3.5 mr-1.5" />
        Add Publication
      </Button>
    </div>
  );
}
