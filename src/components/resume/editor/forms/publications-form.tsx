"use client";

import { Publication, Profile } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ImportFromProfileDialog } from "../../management/dialogs/import-from-profile-dialog";
import { FormField, FORM_INPUT_CLASS } from "@/components/ui/form-field";
import { DeleteButton } from "@/components/ui/delete-button";
import { AddItemButton } from "@/components/ui/add-item-button";
import { cn } from "@/lib/utils";

interface PublicationsFormProps {
  publications: Publication[];
  onChange: (publications: Publication[]) => void;
  profile: Profile;
}

export function PublicationsForm({
  publications,
  onChange,
  profile,
}: PublicationsFormProps) {
  const addPublication = () => {
    onChange([
      { title: "", authors: "", venue: "", date: "", url: "" },
      ...publications,
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

  const handleImportFromProfile = (imported: Publication[]) => {
    onChange([...imported, ...publications]);
  };

  return (
    <div className="space-y-2">
      <div className="@container">
        <div className="flex flex-col @[400px]:flex-row gap-2">
          <AddItemButton
            onClick={addPublication}
            className="flex-1 min-w-[120px]"
          >
            Add Publication
          </AddItemButton>
          <div className="flex-1 min-w-[120px]">
            <ImportFromProfileDialog
              profile={profile}
              type="publications"
              onImport={(data) =>
                handleImportFromProfile(data as Publication[])
              }
              buttonClassName="h-9 w-full mb-0 text-sm border-dashed border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors duration-150"
            />
          </div>
        </div>
      </div>

      {publications.map((pub, index) => (
        <Card
          key={index}
          className="bg-white border border-gray-200 rounded-lg shadow-sm"
        >
          <CardContent className="p-3 space-y-3">
            <div className="flex items-end gap-2">
              <FormField label="Title" className="flex-1">
                <Input
                  value={pub.title}
                  onChange={(e) =>
                    updatePublication(index, "title", e.target.value)
                  }
                  className={cn(FORM_INPUT_CLASS, "font-medium")}
                  placeholder="Research Paper Title"
                />
              </FormField>
              <DeleteButton onClick={() => removePublication(index)} />
            </div>

            <FormField label="Authors" hint="opt">
              <Input
                value={pub.authors || ""}
                onChange={(e) =>
                  updatePublication(index, "authors", e.target.value)
                }
                className={FORM_INPUT_CLASS}
                placeholder="A. Smith, B. Jones, et al."
              />
            </FormField>

            <div className="grid grid-cols-2 gap-2">
              <FormField label="Venue" hint="opt">
                <Input
                  value={pub.venue || ""}
                  onChange={(e) =>
                    updatePublication(index, "venue", e.target.value)
                  }
                  className={FORM_INPUT_CLASS}
                  placeholder="Journal / Conference"
                />
              </FormField>
              <FormField label="Date" hint="opt">
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

            <FormField label="URL" hint="opt">
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
