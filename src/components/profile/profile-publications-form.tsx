"use client";

import { Publication } from "@/lib/types";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FormField, FORM_INPUT_CLASS } from "@/components/ui/form-field";
import { DeleteButton } from "@/components/ui/delete-button";
import { AddItemButton } from "@/components/ui/add-item-button";

interface ProfilePublicationsFormProps {
  publications: Publication[];
  onChange: (publications: Publication[]) => void;
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
                  <FormField label="Title" className="flex-1">
                    <Input
                      value={pub.title}
                      onChange={(e) =>
                        updatePublication(index, "title", e.target.value)
                      }
                      className={FORM_INPUT_CLASS}
                      placeholder="Research Paper Title"
                    />
                  </FormField>
                  <DeleteButton onClick={() => removePublication(index)} />
                </div>

                <FormField label="Authors" hint="Optional">
                  <Input
                    value={pub.authors || ""}
                    onChange={(e) =>
                      updatePublication(index, "authors", e.target.value)
                    }
                    className={FORM_INPUT_CLASS}
                    placeholder="A. Smith, B. Jones, et al."
                  />
                </FormField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField label="Venue" hint="Optional">
                    <Input
                      value={pub.venue || ""}
                      onChange={(e) =>
                        updatePublication(index, "venue", e.target.value)
                      }
                      className={FORM_INPUT_CLASS}
                      placeholder="Journal / Conference"
                    />
                  </FormField>
                  <FormField label="Date" hint="Optional">
                    <Input
                      value={pub.date || ""}
                      onChange={(e) =>
                        updatePublication(index, "date", e.target.value)
                      }
                      className={FORM_INPUT_CLASS}
                      placeholder="June 2024"
                    />
                  </FormField>
                </div>

                <FormField label="URL" hint="Optional">
                  <Input
                    type="url"
                    value={pub.url || ""}
                    onChange={(e) =>
                      updatePublication(index, "url", e.target.value)
                    }
                    className={FORM_INPUT_CLASS}
                    placeholder="https://doi.org/…"
                  />
                </FormField>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <AddItemButton onClick={addPublication} className="w-full">
        Add Publication
      </AddItemButton>
    </div>
  );
}
