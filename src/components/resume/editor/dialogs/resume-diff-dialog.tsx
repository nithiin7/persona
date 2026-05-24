"use client";

import { useState, useEffect, useMemo } from "react";
import { Resume } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, GitCompare } from "lucide-react";
import {
  computeResumeDiff,
  type ResumeDiff,
  type BulletDiff,
  type WorkExpDiff,
  type SkillCategoryDiff,
  type ProjectDiff,
  type EducationDiff,
} from "@/lib/resume-diff";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Bullet diff item
// ---------------------------------------------------------------------------

function BulletItem({ diff }: { diff: BulletDiff }) {
  if (diff.status === "unchanged") {
    return (
      <li className="flex items-start gap-2 text-sm text-gray-500 py-0.5">
        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gray-300" />
        <span>{diff.tailored ?? diff.base}</span>
      </li>
    );
  }

  if (diff.status === "added") {
    return (
      <li className="flex items-start gap-2 text-sm py-0.5">
        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500" />
        <span className="bg-emerald-50 text-emerald-700 rounded px-1">
          {diff.tailored}
        </span>
      </li>
    );
  }

  if (diff.status === "removed") {
    return (
      <li className="flex items-start gap-2 text-sm py-0.5">
        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red-400" />
        <span className="bg-red-50 text-red-600 line-through rounded px-1">
          {diff.base}
        </span>
      </li>
    );
  }

  // changed — show old struck out, then new
  return (
    <li className="flex flex-col gap-0.5 py-0.5">
      <div className="flex items-start gap-2 text-sm">
        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red-400" />
        <span className="bg-red-50 text-red-600 line-through rounded px-1">
          {diff.base}
        </span>
      </div>
      <div className="flex items-start gap-2 text-sm">
        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500" />
        <span className="bg-emerald-50 text-emerald-700 rounded px-1">
          {diff.tailored}
        </span>
      </div>
    </li>
  );
}

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------

function SectionCard({
  title,
  hasChanges,
  children,
}: {
  title: string;
  hasChanges: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div
        className={cn(
          "px-4 py-2.5 flex items-center justify-between",
          hasChanges ? "bg-gray-50" : "bg-white"
        )}
      >
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {title}
        </h3>
        {hasChanges && (
          <span className="text-[10px] font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
            changed
          </span>
        )}
      </div>
      <div className="px-4 py-3 bg-white space-y-4">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Professional summary diff
// ---------------------------------------------------------------------------

function SummarySection({
  baseSummary,
  tailoredSummary,
  changed,
}: {
  baseSummary: string;
  tailoredSummary: string;
  changed: boolean;
}) {
  if (!baseSummary && !tailoredSummary) return null;

  return (
    <SectionCard title="Professional Summary" hasChanges={changed}>
      {!changed ? (
        <p className="text-sm text-gray-500">
          {tailoredSummary || baseSummary}
        </p>
      ) : (
        <div className="space-y-2">
          {baseSummary && (
            <div className="rounded-md bg-red-50 border border-red-100 px-3 py-2">
              <p className="text-[10px] font-medium text-red-400 mb-1">Base</p>
              <p className="text-sm text-red-700 line-through">{baseSummary}</p>
            </div>
          )}
          {tailoredSummary && (
            <div className="rounded-md bg-emerald-50 border border-emerald-100 px-3 py-2">
              <p className="text-[10px] font-medium text-emerald-500 mb-1">
                Tailored
              </p>
              <p className="text-sm text-emerald-700">{tailoredSummary}</p>
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
// Work experience diff
// ---------------------------------------------------------------------------

function WorkEntryDiff({ entry }: { entry: WorkExpDiff }) {
  const exp = entry.tailored ?? entry.base!;
  const isAdded = entry.match === "added";
  const isRemoved = entry.match === "removed";

  return (
    <div
      className={cn(
        "rounded-md border px-3 py-2.5",
        isAdded && "bg-emerald-50 border-emerald-100",
        isRemoved && "bg-red-50 border-red-100",
        entry.match === "matched" && "border-gray-100"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p
            className={cn(
              "text-sm font-medium",
              isAdded && "text-emerald-700",
              isRemoved && "text-red-700 line-through",
              entry.match === "matched" && "text-gray-900"
            )}
          >
            {exp.position}
          </p>
          <p
            className={cn(
              "text-xs",
              isAdded && "text-emerald-600",
              isRemoved && "text-red-500 line-through",
              entry.match === "matched" && "text-gray-500"
            )}
          >
            {exp.company}
            {exp.date ? ` · ${exp.date}` : ""}
          </p>
        </div>
        {isAdded && (
          <span className="text-[10px] font-medium text-emerald-600 bg-emerald-100 rounded px-1.5 py-0.5 shrink-0">
            added
          </span>
        )}
        {isRemoved && (
          <span className="text-[10px] font-medium text-red-500 bg-red-100 rounded px-1.5 py-0.5 shrink-0">
            removed
          </span>
        )}
      </div>

      {entry.match === "matched" && entry.bulletDiffs.length > 0 && (
        <ul className="space-y-0.5 ml-1">
          {entry.bulletDiffs.map((diff, i) => (
            <BulletItem key={i} diff={diff} />
          ))}
        </ul>
      )}

      {entry.match !== "matched" && exp.description.length > 0 && (
        <ul className="space-y-0.5 ml-1">
          {exp.description.map((bullet, i) => (
            <li
              key={i}
              className={cn(
                "flex items-start gap-2 text-sm py-0.5",
                isAdded && "text-emerald-700",
                isRemoved && "text-red-600 line-through"
              )}
            >
              <span
                className={cn(
                  "mt-1.5 h-1 w-1 shrink-0 rounded-full",
                  isAdded && "bg-emerald-500",
                  isRemoved && "bg-red-400"
                )}
              />
              {bullet}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function WorkExperienceSection({ diffs }: { diffs: WorkExpDiff[] }) {
  if (diffs.length === 0) return null;
  const hasChanges = diffs.some(
    (d) => d.match !== "matched" || d.hasBulletChanges
  );
  return (
    <SectionCard title="Work Experience" hasChanges={hasChanges}>
      {diffs.map((entry, i) => (
        <WorkEntryDiff key={i} entry={entry} />
      ))}
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
// Skills diff
// ---------------------------------------------------------------------------

function SkillChip({
  label,
  variant,
}: {
  label: string;
  variant: "added" | "removed" | "unchanged";
}) {
  return (
    <span
      className={cn(
        "inline-block text-xs px-2 py-0.5 rounded border font-medium",
        variant === "added" &&
          "bg-emerald-50 text-emerald-700 border-emerald-200",
        variant === "removed" &&
          "bg-red-50 text-red-600 border-red-200 line-through",
        variant === "unchanged" && "bg-gray-50 text-gray-500 border-gray-200"
      )}
    >
      {label}
    </span>
  );
}

function SkillCategoryRow({ diff }: { diff: SkillCategoryDiff }) {
  const isAdded = diff.match === "added";
  const isRemoved = diff.match === "removed";

  return (
    <div
      className={cn(
        "rounded-md border px-3 py-2.5",
        isAdded && "bg-emerald-50 border-emerald-100",
        isRemoved && "bg-red-50 border-red-100",
        !isAdded && !isRemoved && "border-gray-100"
      )}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <p
          className={cn(
            "text-xs font-medium",
            isAdded && "text-emerald-700",
            isRemoved && "text-red-700 line-through",
            !isAdded && !isRemoved && "text-gray-600"
          )}
        >
          {diff.category}
        </p>
        {isAdded && (
          <span className="text-[10px] font-medium text-emerald-600 bg-emerald-100 rounded px-1.5 py-0.5">
            new category
          </span>
        )}
        {isRemoved && (
          <span className="text-[10px] font-medium text-red-500 bg-red-100 rounded px-1.5 py-0.5">
            removed
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {diff.unchangedItems.map((item) => (
          <SkillChip key={item} label={item} variant="unchanged" />
        ))}
        {diff.removedItems.map((item) => (
          <SkillChip key={item} label={item} variant="removed" />
        ))}
        {diff.addedItems.map((item) => (
          <SkillChip key={item} label={item} variant="added" />
        ))}
      </div>
    </div>
  );
}

function SkillsSection({ diffs }: { diffs: SkillCategoryDiff[] }) {
  if (diffs.length === 0) return null;
  const hasChanges = diffs.some(
    (d) =>
      d.match !== "matched" ||
      d.addedItems.length > 0 ||
      d.removedItems.length > 0
  );
  return (
    <SectionCard title="Skills" hasChanges={hasChanges}>
      {diffs.map((diff, i) => (
        <SkillCategoryRow key={i} diff={diff} />
      ))}
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
// Projects diff
// ---------------------------------------------------------------------------

function ProjectEntryDiff({ entry }: { entry: ProjectDiff }) {
  const proj = entry.tailored ?? entry.base!;
  const isAdded = entry.match === "added";
  const isRemoved = entry.match === "removed";

  return (
    <div
      className={cn(
        "rounded-md border px-3 py-2.5",
        isAdded && "bg-emerald-50 border-emerald-100",
        isRemoved && "bg-red-50 border-red-100",
        entry.match === "matched" && "border-gray-100"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p
          className={cn(
            "text-sm font-medium",
            isAdded && "text-emerald-700",
            isRemoved && "text-red-700 line-through",
            entry.match === "matched" && "text-gray-900"
          )}
        >
          {proj.name}
        </p>
        {isAdded && (
          <span className="text-[10px] font-medium text-emerald-600 bg-emerald-100 rounded px-1.5 py-0.5 shrink-0">
            added
          </span>
        )}
        {isRemoved && (
          <span className="text-[10px] font-medium text-red-500 bg-red-100 rounded px-1.5 py-0.5 shrink-0">
            removed
          </span>
        )}
      </div>

      {entry.match === "matched" && entry.bulletDiffs.length > 0 && (
        <ul className="space-y-0.5 ml-1">
          {entry.bulletDiffs.map((diff, i) => (
            <BulletItem key={i} diff={diff} />
          ))}
        </ul>
      )}

      {entry.match !== "matched" && proj.description.length > 0 && (
        <ul className="space-y-0.5 ml-1">
          {proj.description.map((bullet, i) => (
            <li
              key={i}
              className={cn(
                "flex items-start gap-2 text-sm py-0.5",
                isAdded && "text-emerald-700",
                isRemoved && "text-red-600 line-through"
              )}
            >
              <span
                className={cn(
                  "mt-1.5 h-1 w-1 shrink-0 rounded-full",
                  isAdded && "bg-emerald-500",
                  isRemoved && "bg-red-400"
                )}
              />
              {bullet}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ProjectsSection({ diffs }: { diffs: ProjectDiff[] }) {
  if (diffs.length === 0) return null;
  const hasChanges = diffs.some(
    (d) => d.match !== "matched" || d.hasBulletChanges
  );
  return (
    <SectionCard title="Projects" hasChanges={hasChanges}>
      {diffs.map((entry, i) => (
        <ProjectEntryDiff key={i} entry={entry} />
      ))}
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
// Education diff
// ---------------------------------------------------------------------------

function EducationSection({ diffs }: { diffs: EducationDiff[] }) {
  if (diffs.length === 0) return null;
  const hasChanges = diffs.some((d) => d.match !== "matched");
  return (
    <SectionCard title="Education" hasChanges={hasChanges}>
      {diffs.map((entry, i) => {
        const edu = entry.tailored ?? entry.base!;
        const isAdded = entry.match === "added";
        const isRemoved = entry.match === "removed";
        return (
          <div
            key={i}
            className={cn(
              "rounded-md border px-3 py-2.5",
              isAdded && "bg-emerald-50 border-emerald-100",
              isRemoved && "bg-red-50 border-red-100",
              entry.match === "matched" && "border-gray-100"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p
                  className={cn(
                    "text-sm font-medium",
                    isAdded && "text-emerald-700",
                    isRemoved && "text-red-700 line-through",
                    entry.match === "matched" && "text-gray-900"
                  )}
                >
                  {edu.school}
                </p>
                <p
                  className={cn(
                    "text-xs",
                    isAdded && "text-emerald-600",
                    isRemoved && "text-red-500 line-through",
                    entry.match === "matched" && "text-gray-500"
                  )}
                >
                  {edu.degree} in {edu.field}
                  {edu.date ? ` · ${edu.date}` : ""}
                </p>
              </div>
              {isAdded && (
                <span className="text-[10px] font-medium text-emerald-600 bg-emerald-100 rounded px-1.5 py-0.5 shrink-0">
                  added
                </span>
              )}
              {isRemoved && (
                <span className="text-[10px] font-medium text-red-500 bg-red-100 rounded px-1.5 py-0.5 shrink-0">
                  removed
                </span>
              )}
            </div>
          </div>
        );
      })}
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
// Diff view (assembled from sections)
// ---------------------------------------------------------------------------

function DiffView({
  diff,
  tailoredName,
  baseName,
}: {
  diff: ResumeDiff;
  tailoredName: string;
  baseName: string;
}) {
  const addedCount = countAdded(diff);
  const removedCount = countRemoved(diff);

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span className="font-medium text-gray-700 truncate max-w-[200px]">
          {tailoredName}
        </span>
        <span className="text-gray-300">vs</span>
        <span className="truncate max-w-[200px]">{baseName}</span>
        <div className="ml-auto flex items-center gap-2 shrink-0">
          {addedCount > 0 && (
            <span className="font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5">
              +{addedCount}
            </span>
          )}
          {removedCount > 0 && (
            <span className="font-medium text-red-500 bg-red-50 border border-red-200 rounded px-2 py-0.5">
              -{removedCount}
            </span>
          )}
          {addedCount === 0 && removedCount === 0 && (
            <span className="text-gray-400">No changes</span>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[11px] text-gray-400">
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-sm bg-emerald-300" />
          Added
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-sm bg-red-300" />
          Removed
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-sm bg-gray-200" />
          Unchanged
        </span>
      </div>

      {/* Sections */}
      <SummarySection
        baseSummary={diff.baseSummary}
        tailoredSummary={diff.tailoredSummary}
        changed={diff.summaryChanged}
      />
      <WorkExperienceSection diffs={diff.workExperience} />
      <ProjectsSection diffs={diff.projects} />
      <SkillsSection diffs={diff.skills} />
      <EducationSection diffs={diff.education} />
    </div>
  );
}

function countAdded(diff: ResumeDiff): number {
  let n = 0;
  if (diff.summaryChanged && diff.tailoredSummary) n++;
  for (const w of diff.workExperience) {
    if (w.match === "added") n++;
    else
      n += w.bulletDiffs.filter(
        (b) => b.status === "added" || b.status === "changed"
      ).length;
  }
  for (const s of diff.skills) n += s.addedItems.length;
  for (const p of diff.projects) {
    if (p.match === "added") n++;
    else
      n += p.bulletDiffs.filter(
        (b) => b.status === "added" || b.status === "changed"
      ).length;
  }
  for (const e of diff.education) if (e.match === "added") n++;
  return n;
}

function countRemoved(diff: ResumeDiff): number {
  let n = 0;
  if (diff.summaryChanged && diff.baseSummary) n++;
  for (const w of diff.workExperience) {
    if (w.match === "removed") n++;
    else
      n += w.bulletDiffs.filter(
        (b) => b.status === "removed" || b.status === "changed"
      ).length;
  }
  for (const s of diff.skills) n += s.removedItems.length;
  for (const p of diff.projects) {
    if (p.match === "removed") n++;
    else
      n += p.bulletDiffs.filter(
        (b) => b.status === "removed" || b.status === "changed"
      ).length;
  }
  for (const e of diff.education) if (e.match === "removed") n++;
  return n;
}

// ---------------------------------------------------------------------------
// Main dialog
// ---------------------------------------------------------------------------

interface ResumeDiffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tailoredResume: Resume;
}

interface BaseResumeMeta {
  id: string;
  name: string;
}

export function ResumeDiffDialog({
  open,
  onOpenChange,
  tailoredResume,
}: ResumeDiffDialogProps) {
  const [baseResumes, setBaseResumes] = useState<BaseResumeMeta[]>([]);
  const [selectedBaseId, setSelectedBaseId] = useState<string>("");
  const [baseResume, setBaseResume] = useState<Resume | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingBase, setLoadingBase] = useState(false);

  // Fetch base resume list when dialog opens
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function fetchList() {
      setLoadingList(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("resumes")
        .select("id, name")
        .eq("is_base_resume", true)
        .order("updated_at", { ascending: false });

      if (cancelled) return;
      const list: BaseResumeMeta[] = data ?? [];
      setBaseResumes(list);
      if (list.length === 1) setSelectedBaseId(list[0].id);
      setLoadingList(false);
    }

    fetchList();
    return () => {
      cancelled = true;
    };
  }, [open]);

  // Fetch full base resume when selection changes
  useEffect(() => {
    if (!selectedBaseId) {
      setBaseResume(null);
      return;
    }
    let cancelled = false;

    async function fetchBase() {
      setLoadingBase(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("resumes")
        .select("*")
        .eq("id", selectedBaseId)
        .single();

      if (cancelled) return;
      setBaseResume(data ?? null);
      setLoadingBase(false);
    }

    fetchBase();
    return () => {
      cancelled = true;
    };
  }, [selectedBaseId]);

  const diff = useMemo(() => {
    if (!baseResume) return null;
    return computeResumeDiff(baseResume, tailoredResume);
  }, [baseResume, tailoredResume]);

  const selectedBaseName =
    baseResumes.find((r) => r.id === selectedBaseId)?.name ?? "";

  const isLoading = loadingList || loadingBase;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
            <GitCompare className="h-4 w-4 text-gray-500" />
            Compare Resumes
          </DialogTitle>

          {/* Base selector — sits below title, clear of the absolute close button */}
          {!loadingList && baseResumes.length > 1 && (
            <Select value={selectedBaseId} onValueChange={setSelectedBaseId}>
              <SelectTrigger className="w-64 h-8 text-xs border-gray-200 focus:ring-0 mt-1">
                <SelectValue placeholder="Select base resume…" />
              </SelectTrigger>
              <SelectContent>
                {baseResumes.map((r) => (
                  <SelectItem key={r.id} value={r.id} className="text-xs">
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="px-6 py-5">
            {isLoading && (
              <div className="flex items-center justify-center py-16 text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span className="text-sm">Loading…</span>
              </div>
            )}

            {!isLoading && baseResumes.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <GitCompare className="h-8 w-8 text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-500">
                  No base resumes found
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Create a base resume first to compare against.
                </p>
              </div>
            )}

            {!isLoading && baseResumes.length > 1 && !selectedBaseId && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <GitCompare className="h-8 w-8 text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-500">
                  Select a base resume to compare
                </p>
              </div>
            )}

            {!isLoading && diff && (
              <DiffView
                diff={diff}
                tailoredName={tailoredResume.name}
                baseName={selectedBaseName}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
