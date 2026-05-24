"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { LayoutTemplate, Search } from "lucide-react";
import { WORK_EXPERIENCE_TEMPLATES } from "@/lib/section-templates";
import { cn } from "@/lib/utils";

interface SectionTemplatePickerProps {
  onInsert: (bullets: string[]) => void;
}

export function SectionTemplatePicker({
  onInsert,
}: SectionTemplatePickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [checkedBullets, setCheckedBullets] = useState<Set<string>>(new Set());

  const filtered = WORK_EXPERIENCE_TEMPLATES.filter((t) =>
    t.role.toLowerCase().includes(search.toLowerCase())
  );

  const activeTemplate = WORK_EXPERIENCE_TEMPLATES.find(
    (t) => t.role === selectedRole
  );

  const toggleBullet = (bullet: string) => {
    setCheckedBullets((prev) => {
      const next = new Set(prev);
      if (next.has(bullet)) next.delete(bullet);
      else next.add(bullet);
      return next;
    });
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setCheckedBullets(new Set());
  };

  const handleInsert = () => {
    onInsert(Array.from(checkedBullets));
    setOpen(false);
    setSearch("");
    setCheckedBullets(new Set());
    setSelectedRole(null);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setSearch("");
      setCheckedBullets(new Set());
      setSelectedRole(null);
    }
  };

  const allSelected =
    !!activeTemplate &&
    activeTemplate.bullets.every((b) => checkedBullets.has(b));

  const toggleAll = () => {
    if (!activeTemplate) return;
    if (allSelected) {
      setCheckedBullets(new Set());
    } else {
      setCheckedBullets(new Set(activeTemplate.bullets));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-9 border-dashed border-gray-200 text-gray-400 text-[10px] sm:text-xs hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors duration-150"
        >
          <LayoutTemplate className="h-3.5 w-3.5 mr-1" />
          Templates
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-gray-100">
          <DialogTitle className="text-sm font-semibold text-gray-900">
            Section Templates
          </DialogTitle>
          <p className="text-xs text-gray-500 mt-0.5">
            Browse pre-written bullet starters by role and insert the ones you
            want to adapt.
          </p>
        </DialogHeader>

        <div className="flex h-[420px]">
          {/* Left: role list */}
          <div className="w-52 shrink-0 border-r border-gray-100 flex flex-col">
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                <Input
                  placeholder="Search roles..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 pl-7 text-xs border-gray-200 bg-white focus:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </div>
            <div className="overflow-y-auto flex-1 py-1">
              {filtered.length === 0 && (
                <p className="px-3 py-4 text-[11px] text-gray-400 text-center">
                  No matching roles
                </p>
              )}
              {filtered.map((t) => (
                <button
                  key={t.role}
                  onClick={() => handleRoleSelect(t.role)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-xs transition-colors duration-150",
                    selectedRole === t.role
                      ? "bg-gray-100 text-gray-900 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  {t.role}
                </button>
              ))}
            </div>
          </div>

          {/* Right: bullet list */}
          <div className="flex-1 flex flex-col min-w-0">
            {activeTemplate ? (
              <>
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-gray-900">
                    {activeTemplate.role}
                  </h3>
                  <button
                    onClick={toggleAll}
                    className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors duration-150"
                  >
                    {allSelected ? "Deselect all" : "Select all"}
                  </button>
                </div>
                <div className="overflow-y-auto flex-1 p-4 space-y-3">
                  {activeTemplate.bullets.map((bullet, i) => (
                    <label
                      key={i}
                      className="flex gap-3 items-start cursor-pointer group"
                    >
                      <Checkbox
                        checked={checkedBullets.has(bullet)}
                        onCheckedChange={() => toggleBullet(bullet)}
                        className="mt-0.5 shrink-0"
                      />
                      <span className="text-xs text-gray-600 group-hover:text-gray-900 leading-relaxed transition-colors duration-150">
                        {bullet}
                      </span>
                    </label>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                  <LayoutTemplate className="h-8 w-8 text-gray-200 mx-auto mb-3" />
                  <p className="text-xs text-gray-400">
                    Select a role from the left to browse bullet starters
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {checkedBullets.size > 0
              ? `${checkedBullets.size} bullet${checkedBullets.size !== 1 ? "s" : ""} selected`
              : "Select bullets to insert"}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenChange(false)}
              className="h-8 text-xs border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleInsert}
              disabled={checkedBullets.size === 0}
              className="h-8 text-xs bg-gray-900 text-white hover:bg-gray-700 transition-colors duration-200 disabled:opacity-40"
            >
              Insert{checkedBullets.size > 0 ? ` ${checkedBullets.size}` : ""}{" "}
              {checkedBullets.size !== 1 ? "bullets" : "bullet"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
