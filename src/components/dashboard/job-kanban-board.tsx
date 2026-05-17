"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  MapPin,
  DollarSign,
  ExternalLink,
  Trash2,
  FileText,
} from "lucide-react";
import type { Job, ApplicationStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { updateJobStatus, deleteJob } from "@/utils/actions/jobs/actions";

const COLUMNS: {
  status: ApplicationStatus;
  label: string;
  dotClass: string;
  textClass: string;
}[] = [
  {
    status: "saved",
    label: "Saved",
    dotClass: "bg-gray-400",
    textClass: "text-gray-600",
  },
  {
    status: "applied",
    label: "Applied",
    dotClass: "bg-blue-400",
    textClass: "text-blue-600",
  },
  {
    status: "phone_screen",
    label: "Phone Screen",
    dotClass: "bg-amber-400",
    textClass: "text-amber-600",
  },
  {
    status: "onsite",
    label: "Onsite",
    dotClass: "bg-purple-400",
    textClass: "text-purple-600",
  },
  {
    status: "offer",
    label: "Offer",
    dotClass: "bg-emerald-400",
    textClass: "text-emerald-600",
  },
  {
    status: "rejected",
    label: "Rejected",
    dotClass: "bg-red-400",
    textClass: "text-red-500",
  },
];

const WORK_LOCATION_LABEL: Record<string, string> = {
  remote: "Remote",
  in_person: "On-site",
  hybrid: "Hybrid",
};

function MatchScoreBadge({ score }: { score: number }) {
  const colorClass =
    score >= 80
      ? "bg-emerald-50 text-emerald-700"
      : score >= 50
        ? "bg-amber-50 text-amber-700"
        : "bg-red-50 text-red-600";
  return (
    <span
      className={cn(
        "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
        colorClass
      )}
    >
      {score}% match
    </span>
  );
}

function KanbanCard({
  job,
  resumeId,
  matchScore,
  isDragging,
  onDragStart,
  onDragEnd,
  onDelete,
}: {
  job: Job;
  resumeId?: string;
  matchScore?: number;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "group relative bg-white border border-gray-200 rounded-xl p-3 cursor-grab active:cursor-grabbing",
        "hover:border-gray-300 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 select-none",
        isDragging && "opacity-40"
      )}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 h-6 w-6 flex items-center justify-center rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all duration-150"
        aria-label="Delete job"
      >
        <Trash2 className="h-3 w-3" />
      </button>
      <div className="space-y-1.5">
        <div>
          <p className="text-sm font-semibold text-gray-900 truncate">
            {job.company_name || (
              <span className="text-gray-400 font-normal italic">
                Unnamed company
              </span>
            )}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {job.position_title || (
              <span className="text-gray-300 italic">No title</span>
            )}
          </p>
        </div>

        {(job.location || job.work_location || job.salary_range) && (
          <div className="flex flex-wrap gap-x-2 gap-y-1 pt-0.5">
            {job.work_location && (
              <span className="inline-flex items-center text-[11px] bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">
                {WORK_LOCATION_LABEL[job.work_location] ?? job.work_location}
              </span>
            )}
            {job.location && (
              <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                <MapPin className="h-2.5 w-2.5 shrink-0" />
                <span className="truncate max-w-[100px]">{job.location}</span>
              </span>
            )}
            {job.salary_range && (
              <span className="inline-flex items-center gap-0.5 text-[11px] text-gray-400">
                <DollarSign className="h-2.5 w-2.5 shrink-0" />
                <span className="truncate max-w-[80px]">
                  {job.salary_range}
                </span>
              </span>
            )}
          </div>
        )}
      </div>

      {matchScore !== undefined && (
        <div className="mt-2">
          <MatchScoreBadge score={matchScore} />
        </div>
      )}

      <div className="mt-2 flex items-center gap-3">
        {job.job_url && (
          <a
            href={job.job_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 transition-colors duration-150"
          >
            <ExternalLink className="h-2.5 w-2.5" />
            View posting
          </a>
        )}
        {resumeId && (
          <Link
            href={`/resumes/${resumeId}`}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-[11px] text-teal-600 hover:text-teal-700 transition-colors duration-150"
          >
            <FileText className="h-2.5 w-2.5" />
            View resume
          </Link>
        )}
      </div>
    </div>
  );
}

function KanbanColumn({
  label,
  dotClass,
  textClass,
  jobs,
  draggingId,
  isOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onCardDragStart,
  onCardDragEnd,
  onCardDelete,
  jobResumeMap,
  matchScoreMap,
}: {
  label: string;
  dotClass: string;
  textClass: string;
  jobs: Job[];
  draggingId: string | null;
  isOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onCardDragStart: (id: string) => void;
  onCardDragEnd: () => void;
  onCardDelete: (id: string) => void;
  jobResumeMap: Record<string, string>;
  matchScoreMap: Record<string, number>;
}) {
  return (
    <div
      className={cn(
        "w-56 flex-shrink-0 flex flex-col rounded-xl border transition-colors duration-150",
        isOver ? "border-gray-400 bg-gray-100" : "border-gray-200 bg-gray-50/60"
      )}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="px-3 py-2.5 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className={cn("h-2 w-2 rounded-full shrink-0", dotClass)} />
          <span className={cn("text-xs font-semibold", textClass)}>
            {label}
          </span>
        </div>
        <span className="text-xs font-medium text-gray-400 tabular-nums">
          {jobs.length}
        </span>
      </div>

      <div className="flex-1 p-2 space-y-2 min-h-[100px]">
        {jobs.length === 0 ? (
          <div
            className={cn(
              "h-full min-h-[80px] rounded-lg border border-dashed flex items-center justify-center",
              isOver ? "border-gray-400 bg-gray-100" : "border-gray-200"
            )}
          >
            <p className="text-[11px] text-gray-300 select-none">Drop here</p>
          </div>
        ) : (
          jobs.map((job) => (
            <KanbanCard
              key={job.id}
              job={job}
              resumeId={jobResumeMap[job.id]}
              matchScore={matchScoreMap[job.id]}
              isDragging={draggingId === job.id}
              onDragStart={() => onCardDragStart(job.id)}
              onDragEnd={onCardDragEnd}
              onDelete={() => onCardDelete(job.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function JobKanbanBoard({
  initialJobs,
  jobResumeMap,
  matchScoreMap,
}: {
  initialJobs: Job[];
  jobResumeMap: Record<string, string>;
  matchScoreMap: Record<string, number>;
}) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] =
    useState<ApplicationStatus | null>(null);

  const grouped = COLUMNS.reduce<Record<ApplicationStatus, Job[]>>(
    (acc, { status }) => {
      acc[status] = jobs.filter(
        (j) =>
          j.application_status === status ||
          (status === "saved" && j.application_status === null)
      );
      return acc;
    },
    {} as Record<ApplicationStatus, Job[]>
  );

  const handleCardDragStart = useCallback((id: string) => {
    setDraggingId(id);
  }, []);

  const handleCardDragEnd = useCallback(() => {
    setDraggingId(null);
    setDragOverStatus(null);
  }, []);

  const handleColumnDragOver = useCallback(
    (e: React.DragEvent, status: ApplicationStatus) => {
      e.preventDefault();
      setDragOverStatus(status);
    },
    []
  );

  const handleColumnDragLeave = useCallback(() => {
    setDragOverStatus(null);
  }, []);

  const handleCardDelete = useCallback(
    async (id: string) => {
      // Optimistic remove
      setJobs((prev) => prev.filter((j) => j.id !== id));
      try {
        await deleteJob(id);
      } catch {
        // Revert on failure — re-fetch isn't easy here so just restore from initialJobs
        setJobs((prev) => {
          const original = initialJobs.find((j) => j.id === id);
          return original ? [...prev, original] : prev;
        });
      }
    },
    [initialJobs]
  );

  const handleColumnDrop = useCallback(
    async (e: React.DragEvent, targetStatus: ApplicationStatus) => {
      e.preventDefault();
      setDragOverStatus(null);

      const id = draggingId;
      if (!id) return;

      const job = jobs.find((j) => j.id === id);
      if (!job) return;

      const currentStatus = job.application_status ?? "saved";
      if (currentStatus === targetStatus) {
        setDraggingId(null);
        return;
      }

      // Optimistic update
      setJobs((prev) =>
        prev.map((j) =>
          j.id === id ? { ...j, application_status: targetStatus } : j
        )
      );
      setDraggingId(null);

      try {
        await updateJobStatus(id, targetStatus);
      } catch {
        // Revert on failure
        setJobs((prev) =>
          prev.map((j) =>
            j.id === id
              ? { ...j, application_status: job.application_status }
              : j
          )
        );
      }
    },
    [draggingId, jobs]
  );

  if (jobs.length === 0) {
    return (
      <div className="flex items-center justify-center h-20 border border-dashed border-gray-200 rounded-xl bg-white">
        <p className="text-sm text-gray-400">
          No jobs tracked yet — add one via a tailored resume.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-3 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex gap-3 min-w-max">
        {COLUMNS.map(({ status, label, dotClass, textClass }) => (
          <KanbanColumn
            key={status}
            label={label}
            dotClass={dotClass}
            textClass={textClass}
            jobs={grouped[status]}
            draggingId={draggingId}
            isOver={dragOverStatus === status}
            onDragOver={(e) => handleColumnDragOver(e, status)}
            onDragLeave={handleColumnDragLeave}
            onDrop={(e) => handleColumnDrop(e, status)}
            onCardDragStart={handleCardDragStart}
            onCardDragEnd={handleCardDragEnd}
            onCardDelete={handleCardDelete}
            jobResumeMap={jobResumeMap}
            matchScoreMap={matchScoreMap}
          />
        ))}
      </div>
    </div>
  );
}
