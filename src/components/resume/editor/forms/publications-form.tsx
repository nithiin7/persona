"use client";

import { Publication, Profile } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { ImportFromProfileDialog } from "../../management/dialogs/import-from-profile-dialog";
import React from "react";

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

  const inputClass =
    "h-8 border-gray-200 bg-white placeholder:text-gray-400 text-sm focus:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0";

  return (
    <div className="space-y-2">
      <div className="@container">
        <div className="flex flex-col @[400px]:flex-row gap-2">
          <Button
            variant="outline"
            className="flex-1 h-9 min-w-[120px] border-dashed border-gray-200 text-gray-400 text-sm hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors duration-150"
            onClick={addPublication}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5 shrink-0" />
            Add Publication
          </Button>
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
              <div className="space-y-1 flex-1">
                <label className="text-xs font-medium text-gray-500">
                  Title
                </label>
                <Input
                  value={pub.title}
                  onChange={(e) =>
                    updatePublication(index, "title", e.target.value)
                  }
                  className={inputClass + " font-medium"}
                  placeholder="Research Paper Title"
                />
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

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">
                Authors <span className="text-gray-400">(opt)</span>
              </label>
              <Input
                value={pub.authors || ""}
                onChange={(e) =>
                  updatePublication(index, "authors", e.target.value)
                }
                className={inputClass}
                placeholder="A. Smith, B. Jones, et al."
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">
                  Venue <span className="text-gray-400">(opt)</span>
                </label>
                <Input
                  value={pub.venue || ""}
                  onChange={(e) =>
                    updatePublication(index, "venue", e.target.value)
                  }
                  className={inputClass}
                  placeholder="Journal / Conference"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">
                  Date <span className="text-gray-400">(opt)</span>
                </label>
                <Input
                  value={pub.date || ""}
                  onChange={(e) =>
                    updatePublication(index, "date", e.target.value)
                  }
                  className={inputClass}
                  placeholder="June 2024"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">
                URL <span className="text-gray-400">(opt)</span>
              </label>
              <Input
                type="url"
                value={pub.url || ""}
                onChange={(e) =>
                  updatePublication(index, "url", e.target.value)
                }
                className={inputClass}
                placeholder="https://doi.org/…"
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
