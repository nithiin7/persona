"use client";

import {
  WorkExperience,
  Project,
  Profile,
  Education,
  Skill,
  Certification,
} from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

type ImportItem = WorkExperience | Project | Education | Skill | Certification;

interface ImportFromProfileDialogProps<T extends ImportItem> {
  profile: Profile;
  onImport: (items: T[]) => void;
  type:
    | "work_experience"
    | "projects"
    | "education"
    | "skills"
    | "certifications";
  buttonClassName?: string;
}

export function ImportFromProfileDialog<T extends ImportItem>({
  profile,
  onImport,
  type,
  buttonClassName,
}: ImportFromProfileDialogProps<T>) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const items =
    type === "work_experience"
      ? profile.work_experience
      : type === "projects"
        ? profile.projects
        : type === "education"
          ? profile.education
          : type === "certifications"
            ? profile.certifications || []
            : profile.skills;

  const title =
    type === "work_experience"
      ? "Work Experience"
      : type === "projects"
        ? "Projects"
        : type === "education"
          ? "Education"
          : type === "certifications"
            ? "Certifications"
            : "Skills";

  const handleImport = () => {
    const itemsToImport = items.filter((item) =>
      selectedItems.includes(getItemId(item))
    ) as T[];
    onImport(itemsToImport);
    setOpen(false);
    setSelectedItems([]);
  };

  const getItemId = (item: ImportItem): string => {
    if (type === "work_experience") {
      const exp = item as WorkExperience;
      return `${exp.company}-${exp.position}-${exp.date}`;
    } else if (type === "projects") {
      return (item as Project).name;
    } else if (type === "education") {
      const edu = item as Education;
      return `${edu.school}-${edu.degree}-${edu.field}`;
    } else if (type === "certifications") {
      const cert = item as Certification;
      return `${cert.name}-${cert.provider}`;
    } else {
      return (item as Skill).category;
    }
  };

  const getItemTitle = (item: ImportItem): string => {
    if (type === "work_experience") return (item as WorkExperience).company;
    if (type === "projects") return (item as Project).name;
    if (type === "education") {
      const edu = item as Education;
      return `${edu.degree} in ${edu.field}`;
    }
    if (type === "certifications") return (item as Certification).name;
    return (item as Skill).category;
  };

  const getItemSubtitle = (item: ImportItem): string | null => {
    if (type === "work_experience") return (item as WorkExperience).position;
    if (type === "projects")
      return ((item as Project).technologies || []).join(", ") || null;
    if (type === "education") return (item as Education).school;
    if (type === "certifications") return (item as Certification).provider;
    return null;
  };

  const getItemDate = (item: ImportItem): string => {
    if (type === "work_experience") return (item as WorkExperience).date;
    if (type === "projects") return (item as Project).date || "";
    if (type === "education") return (item as Education).date;
    if (type === "certifications") return (item as Certification).date || "";
    return "";
  };

  const allSelected = items.length > 0 && selectedItems.length === items.length;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(getItemId));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full h-9 border-dashed border-gray-200 text-gray-400 text-sm",
            "hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50",
            "transition-colors duration-150",
            buttonClassName
          )}
        >
          <UserCircle2 className="h-3.5 w-3.5 mr-1.5 shrink-0" />
          Import from Profile
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[520px] p-0 bg-white border border-gray-200 shadow-md rounded-xl overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
          <DialogTitle className="text-base font-semibold text-gray-900">
            Import {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500 mt-0.5">
            Select items from your profile to add to this resume.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {selectedItems.length} of {items.length} selected
          </span>
          {items.length > 0 && (
            <button
              onClick={toggleAll}
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors duration-150"
            >
              {allSelected ? "Deselect all" : "Select all"}
            </button>
          )}
        </div>

        <ScrollArea className="max-h-[380px]">
          <div className="px-6 py-3 space-y-2">
            {items.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">
                No {title.toLowerCase()} in your profile yet.
              </div>
            ) : (
              items.map((item) => {
                const id = getItemId(item);
                const isSelected = selectedItems.includes(id);
                return (
                  <label
                    key={id}
                    htmlFor={id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors duration-150",
                      isSelected
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300"
                    )}
                  >
                    <Checkbox
                      id={id}
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        setSelectedItems((prev) =>
                          checked ? [...prev, id] : prev.filter((x) => x !== id)
                        );
                      }}
                      className="mt-0.5 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {getItemTitle(item)}
                      </p>
                      {getItemSubtitle(item) && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {getItemSubtitle(item)}
                        </p>
                      )}
                      {getItemDate(item) && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {getItemDate(item)}
                        </p>
                      )}
                      {type === "skills" && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(item as Skill).items.map((skill, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[11px] border border-gray-200"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50/60">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-gray-200 text-gray-600 hover:bg-white transition-colors duration-150"
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={selectedItems.length === 0}
            className="bg-gray-900 hover:bg-gray-700 text-white transition-colors duration-150"
          >
            Import {selectedItems.length > 0 ? `(${selectedItems.length})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
