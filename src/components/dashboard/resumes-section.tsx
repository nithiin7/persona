"use client";

import {
  Trash2,
  Copy,
  FileText,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { MiniResumePreview } from "@/components/resume/shared/mini-resume-preview";
import { CreateResumeDialog } from "@/components/resume/management/dialogs/create-resume-dialog";
import {
  ResumeSortControls,
  type SortOption,
  type SortDirection,
} from "@/components/resume/management/resume-sort-controls";
import type { ApplicationStatus, Profile, ResumeSummary } from "@/lib/types";
import {
  deleteResume,
  copyResume,
  updateResume,
} from "@/utils/actions/resumes/actions";
import { updateJobStatus } from "@/utils/actions/jobs/actions";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { useState, useOptimistic, useTransition } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { toast } from "sonner";

// Extended Resume type for optimistic updates
interface OptimisticResume extends ResumeSummary {
  isOptimistic?: boolean;
  originalId?: string;
}

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; color: string; dot: string }
> = {
  saved: {
    label: "Saved",
    color: "bg-gray-100 text-gray-600 border-gray-200",
    dot: "bg-gray-400",
  },
  applied: {
    label: "Applied",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  phone_screen: {
    label: "Phone Screen",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  onsite: {
    label: "Onsite",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
  },
  offer: {
    label: "Offer",
    color: "bg-green-50 text-green-700 border-green-200",
    dot: "bg-green-500",
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-50 text-red-600 border-red-200",
    dot: "bg-red-400",
  },
};

function StatusBadge({ resume }: { resume: OptimisticResume }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const status = (resume.application_status ?? "saved") as ApplicationStatus;
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.saved;

  const handleSelect = async (next: ApplicationStatus) => {
    if (!resume.job_id || next === status) {
      setOpen(false);
      return;
    }
    setUpdating(true);
    setOpen(false);
    try {
      await updateJobStatus(resume.job_id, next);
      router.refresh();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          onClick={(e) => e.preventDefault()}
          disabled={updating || !resume.job_id}
          className={cn(
            "flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[9px] font-semibold",
            "transition-all duration-200 hover:opacity-80",
            cfg.color,
            (updating || !resume.job_id) && "opacity-50 cursor-not-allowed"
          )}
        >
          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", cfg.dot)} />
          {updating ? "..." : cfg.label}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-1" align="start" side="bottom">
        <div className="flex flex-col gap-0.5">
          {(
            Object.entries(STATUS_CONFIG) as [
              ApplicationStatus,
              (typeof STATUS_CONFIG)[ApplicationStatus],
            ][]
          ).map(([key, val]) => (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-left",
                "hover:bg-gray-100 transition-colors duration-150",
                key === status && "font-semibold"
              )}
            >
              <span className={cn("w-2 h-2 rounded-full shrink-0", val.dot)} />
              {val.label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface ResumesSectionProps {
  type: "base" | "tailored";
  resumes: ResumeSummary[];
  profile: Profile;
  sortParam: string;
  directionParam: string;
  currentSort: SortOption;
  currentDirection: SortDirection;
  baseResumes?: ResumeSummary[]; // Only needed for tailored type
  canCreateMore?: boolean;
}

interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
}

export function ResumesSection({
  type,
  resumes,
  profile,
  sortParam,
  directionParam,
  currentSort,
  currentDirection,
  baseResumes = [],
  canCreateMore,
}: ResumesSectionProps) {
  // Optimistic state for deletions
  const [optimisticResumes, removeOptimisticResume] = useOptimistic(
    resumes as OptimisticResume[],
    (state, deletedResumeId: string) =>
      state.filter((resume) => resume.id !== deletedResumeId)
  );

  // Optimistic state for copying
  const [optimisticCopiedResumes, addOptimisticCopy] = useOptimistic(
    optimisticResumes,
    (state, newResume: OptimisticResume) => {
      // Always add new resume at the beginning (leftmost position)
      return [newResume, ...state];
    }
  );

  const [, startTransition] = useTransition();
  const router = useRouter();
  const [deletingResumes, setDeletingResumes] = useState<Set<string>>(
    new Set()
  );
  const [copyingResumes, setCopyingResumes] = useState<Set<string>>(new Set());
  const [renamingResume, setRenamingResume] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const config = {
    base: {
      gradient: "from-purple-600 to-indigo-600",
      border: "border-purple-300",
      bg: "bg-purple-50",
      text: "text-purple-600",
      icon: FileText,
      accent: {
        bg: "purple-100",
        hover: "purple-100/50",
      },
    },
    tailored: {
      gradient: "from-pink-600 to-rose-600",
      border: "border-pink-300",
      bg: "bg-pink-50",
      text: "text-pink-600",
      icon: Sparkles,
      accent: {
        bg: "pink-100",
        hover: "pink-100/50",
      },
    },
  }[type];

  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    itemsPerPage: 7,
  });

  // Handle optimistic deletion
  const handleDeleteResume = async (resumeId: string, resumeName: string) => {
    // Add to deleting set for visual feedback
    setDeletingResumes((prev) => new Set(prev).add(resumeId));

    // Optimistically remove from UI immediately
    removeOptimisticResume(resumeId);

    // Show immediate feedback
    toast.loading(`Deleting "${resumeName}"...`, { id: resumeId });

    try {
      // Call server action in background
      await deleteResume(resumeId);

      // Success feedback
      toast.success(`"${resumeName}" deleted successfully`, { id: resumeId });
    } catch (error) {
      // On error, the optimistic update will automatically rollback
      console.error("Failed to delete resume:", error);
      toast.error(`Failed to delete "${resumeName}". Please try again.`, {
        id: resumeId,
      });
    } finally {
      // Remove from deleting set
      setDeletingResumes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(resumeId);
        return newSet;
      });
    }
  };

  const handleRenameResume = async () => {
    if (!renamingResume || !renameValue.trim()) return;
    const trimmed = renameValue.trim();
    const { id, name: oldName } = renamingResume;
    setRenamingResume(null);
    toast.loading(`Renaming to "${trimmed}"...`, { id: `rename-${id}` });
    try {
      await updateResume(id, { name: trimmed });
      toast.success(`Renamed to "${trimmed}"`, { id: `rename-${id}` });
      router.refresh();
    } catch {
      toast.error(`Failed to rename "${oldName}". Please try again.`, {
        id: `rename-${id}`,
      });
    }
  };

  // Handle optimistic copying
  const handleCopyResume = async (sourceResume: OptimisticResume) => {
    // Add to copying set for visual feedback
    setCopyingResumes((prev) => new Set(prev).add(sourceResume.id));

    // Create optimistic copy
    const optimisticCopy: OptimisticResume = {
      ...sourceResume,
      id: `temp-${Date.now()}-${Math.random()}`, // Temporary unique ID
      name: `${sourceResume.name} (Copy)`,
      isOptimistic: true,
      originalId: sourceResume.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Optimistically add to UI immediately
    addOptimisticCopy(optimisticCopy);

    // Show immediate feedback
    toast.loading(`Copying "${sourceResume.name}"...`, {
      id: `copy-${sourceResume.id}`,
    });

    try {
      // Call server action in background
      await copyResume(sourceResume.id);

      // Success feedback - the real resume will appear via revalidation
      toast.success(`"${sourceResume.name}" copied successfully`, {
        id: `copy-${sourceResume.id}`,
      });
    } catch (error) {
      // On error, the optimistic update will automatically rollback
      console.error("Failed to copy resume:", error);
      toast.error(`Failed to copy "${sourceResume.name}". Please try again.`, {
        id: `copy-${sourceResume.id}`,
      });
    } finally {
      // Remove from copying set
      setCopyingResumes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(sourceResume.id);
        return newSet;
      });
    }
  };

  const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
  const endIndex = startIndex + pagination.itemsPerPage;
  const paginatedResumes = optimisticCopiedResumes.slice(startIndex, endIndex);

  function handlePageChange(page: number) {
    setPagination((prev) => ({
      ...prev,
      currentPage: page,
    }));
  }

  // Create Resume Card Component
  const CreateResumeCard = () => (
    <CreateResumeDialog
      type={type}
      profile={profile}
      {...(type === "tailored" && { baseResumes })}
    >
      <button
        className={cn(
          "aspect-[8.5/11] rounded-lg w-full sm:w-auto mr-8 sm:mr-0",
          "relative overflow-hidden",
          "border-2 border-dashed border-gray-200",
          "group/new-resume flex flex-col items-center justify-center gap-3",
          "bg-white hover:bg-gray-50",
          "transition-all duration-200 hover:border-gray-300 hover:shadow-sm hover:-translate-y-0.5"
        )}
      >
        <div className="flex flex-col items-center gap-3 transition-transform duration-200 group-hover/new-resume:-translate-y-0.5">
          <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center transition-colors duration-200 group-hover/new-resume:bg-gray-200">
            <config.icon className="h-5 w-5 text-gray-400 transition-colors duration-200 group-hover/new-resume:text-gray-600" />
          </div>
          <span className="text-sm font-medium text-gray-400 transition-colors duration-200 group-hover/new-resume:text-gray-600">
            Create {type === "base" ? "Base" : "Tailored"}
          </span>
        </div>
      </button>
    </CreateResumeDialog>
  );

  // Limit Reached Card Component
  const LimitReachedCard = () => (
    <Link
      href="/subscription"
      className={cn(
        "group/limit block",
        "cursor-pointer",
        "transition-all duration-500",
        "hover:-translate-y-1"
      )}
    >
      <div
        className={cn(
          "aspect-[8.5/11] rounded-lg",
          "relative overflow-hidden",
          "border-2 border-dashed",
          "flex flex-col items-center justify-center gap-4",
          "border-amber-600/80",
          "bg-gradient-to-br from-amber-50/80 via-amber-50/40 to-amber-100/60",
          "transition-all duration-500",
          "hover:shadow-xl hover:shadow-amber-200/20",
          "hover:border-amber-600/90",
          "after:absolute after:inset-0 after:bg-gradient-to-br",
          "after:from-amber-600/[0.03] after:to-orange-600/[0.03]",
          "after:opacity-40 after:transition-opacity after:duration-500",
          "hover:after:opacity-60"
        )}
      >
        <div
          className={cn(
            "relative z-10 flex flex-col items-center",
            "transform transition-all duration-500",
            "group-hover/limit:scale-105"
          )}
        >
          <div
            className={cn(
              "h-12 w-12 rounded-xl",
              "flex items-center justify-center",
              "bg-gradient-to-br from-amber-100 to-amber-50",
              "text-amber-600",
              "shadow-md",
              "transition-all duration-500",
              "group-hover/limit:shadow-lg",
              "group-hover/limit:bg-gradient-to-br",
              "group-hover/limit:from-amber-200",
              "group-hover/limit:to-amber-100",
              "group-hover/limit:-translate-y-1"
            )}
          >
            <config.icon
              className={cn(
                "h-5 w-5",
                "transition-all duration-500",
                "group-hover/limit:scale-110"
              )}
            />
          </div>
          <span
            className={cn(
              "mt-4 text-sm font-medium",
              "text-amber-600",
              "transition-all duration-500",
              "group-hover/limit:text-amber-700"
            )}
          >
            {type === "base" ? "Base" : "Tailored"} Limit Reached
          </span>
          <span
            className={cn(
              "mt-2 text-xs",
              "text-amber-600/70",
              "underline underline-offset-4",
              "transition-all duration-300",
              "group-hover/limit:text-amber-700/90"
            )}
          >
            Upgrade to create more
          </span>
        </div>
      </div>
    </Link>
  );

  // Resume Card Component with optimistic states
  const ResumeCard = ({ resume }: { resume: OptimisticResume }) => {
    const isDeleting = deletingResumes.has(resume.id);
    const isCopying = copyingResumes.has(resume.originalId || resume.id);

    return (
      <div
        className={cn(
          "group relative transition-all duration-300",
          isDeleting && "opacity-50 pointer-events-none",
          resume.isOptimistic && "animate-in slide-in-from-top-1 duration-300"
        )}
      >
        <AlertDialog>
          <div className="relative">
            {/* Resume Preview - Conditional Link */}
            {resume.isOptimistic ? (
              // Not clickable during processing
              <div className={cn("cursor-wait", "relative")}>
                <MiniResumePreview
                  name={resume.name}
                  type={type}
                  target_role={resume.target_role}
                  createdAt={resume.created_at}
                  className={cn(
                    "transition-all duration-300 opacity-60",
                    "pointer-events-none"
                  )}
                />
                {/* Loading Overlay */}
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    <span className="text-xs font-medium text-gray-400">
                      Copying…
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              // Normal clickable resume
              <Link href={`/resumes/${resume.id}`}>
                <MiniResumePreview
                  name={resume.name}
                  type={type}
                  target_role={resume.target_role}
                  createdAt={resume.created_at}
                  className="hover:-translate-y-1 transition-transform duration-300"
                />
              </Link>
            )}

            {/* Application Status Badge (tailored only) */}
            {!resume.isOptimistic && type === "tailored" && resume.job_id && (
              <div className="absolute top-1.5 right-1.5 z-10">
                <StatusBadge resume={resume} />
              </div>
            )}

            {/* Action Buttons */}
            {!resume.isOptimistic && (
              <div className="absolute bottom-2 left-2 flex gap-2">
                <AlertDialogTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={isDeleting}
                    className={cn(
                      "h-7 w-7 rounded-md",
                      "bg-white/80 text-gray-400",
                      "border border-gray-200",
                      "hover:text-red-500 hover:bg-red-50 hover:border-red-200",
                      "transition-colors duration-150",
                      isDeleting && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>

                {/* Rename Button */}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setRenamingResume({ id: resume.id, name: resume.name });
                    setRenameValue(resume.name);
                  }}
                  disabled={isDeleting}
                  className={cn(
                    "h-7 w-7 rounded-md",
                    "bg-white/80 text-gray-400",
                    "border border-gray-200",
                    "hover:text-gray-700 hover:bg-gray-100 hover:border-gray-300",
                    "transition-colors duration-150"
                  )}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>

                {/* Copy Button */}
                {canCreateMore ? (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      startTransition(() => {
                        handleCopyResume(resume);
                      });
                    }}
                    disabled={isDeleting || isCopying}
                    className={cn(
                      "h-7 w-7 rounded-md",
                      "bg-white/80 text-gray-400",
                      "border border-gray-200",
                      "hover:text-gray-700 hover:bg-gray-100 hover:border-gray-300",
                      "transition-colors duration-150",
                      (isDeleting || isCopying) &&
                        "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isCopying ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                ) : (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className={cn(
                          "h-7 w-7 rounded-md",
                          "bg-white/80 text-gray-400",
                          "border border-gray-200",
                          "hover:text-gray-700 hover:bg-gray-100 hover:border-gray-300",
                          "transition-colors duration-150"
                        )}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white border border-gray-200 shadow-md">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Limit Reached</AlertDialogTitle>
                        <AlertDialogDescription>
                          You&apos;ve reached the maximum number of {type}{" "}
                          resumes. Upgrade to create unlimited resumes and
                          unlock additional features.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-gray-200 hover:bg-gray-50">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction asChild>
                          <Link
                            href="/subscription"
                            className="bg-gray-900 text-white hover:bg-gray-700 transition-colors duration-150"
                          >
                            Upgrade to Pro
                          </Link>
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            )}
          </div>
          <AlertDialogContent className="bg-white border border-gray-200 shadow-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Resume</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{resume.name}&quot;? This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-gray-200 hover:bg-gray-50">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  startTransition(() => {
                    handleDeleteResume(resume.id, resume.name);
                  });
                }}
                className="bg-red-600 text-white hover:bg-red-700 transition-colors duration-150"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  };

  return (
    <div className="relative ">
      <div className="flex flex-col gap-4 w-full">
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900">
            {type === "base" ? "Base" : "Tailored"} Resumes
          </h2>
          <div className="flex items-center gap-2 mb-4">
            <ResumeSortControls
              sortParam={sortParam}
              directionParam={directionParam}
              currentSort={currentSort}
              currentDirection={currentDirection}
            />
          </div>
        </div>

        {/* Desktop Pagination (hidden on mobile) */}
        {optimisticCopiedResumes.length > pagination.itemsPerPage && (
          <div className="hidden md:flex w-full items-start justify-start -mt-4">
            <Pagination className="flex justify-end">
              <PaginationContent className="gap-1">
                <PaginationItem>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </PaginationItem>

                {Array.from({
                  length: Math.ceil(
                    optimisticCopiedResumes.length / pagination.itemsPerPage
                  ),
                }).map((_, index) => {
                  const pageNumber = index + 1;
                  const totalPages = Math.ceil(
                    optimisticCopiedResumes.length / pagination.itemsPerPage
                  );

                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= pagination.currentPage - 1 &&
                      pageNumber <= pagination.currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={index}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePageChange(pageNumber)}
                          className={cn(
                            "h-8 w-8 p-0",
                            "text-muted-foreground hover:text-foreground",
                            pagination.currentPage === pageNumber &&
                              "font-medium text-foreground"
                          )}
                        >
                          {pageNumber}
                        </Button>
                      </PaginationItem>
                    );
                  }

                  if (
                    (pageNumber === 2 && pagination.currentPage > 3) ||
                    (pageNumber === totalPages - 1 &&
                      pagination.currentPage < totalPages - 2)
                  ) {
                    return (
                      <PaginationItem key={index}>
                        <span className="text-muted-foreground px-2">...</span>
                      </PaginationItem>
                    );
                  }

                  return null;
                })}

                <PaginationItem>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={
                      pagination.currentPage ===
                      Math.ceil(
                        optimisticCopiedResumes.length / pagination.itemsPerPage
                      )
                    }
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      <div className="relative pb-6">
        {/* Mobile View */}
        <div className="md:hidden w-full space-y-6">
          {/* Mobile Create Resume Button Row */}
          {canCreateMore ? (
            <div className="px-2 w-full  flex">
              <CreateResumeCard />
            </div>
          ) : (
            <div className="px-4 w-full">
              <LimitReachedCard />
            </div>
          )}

          {/* Mobile Resumes Carousel */}
          {paginatedResumes.length > 0 && (
            <div className="w-full">
              <Carousel className="w-full">
                <CarouselContent>
                  {paginatedResumes.map((resume) => (
                    <CarouselItem key={resume.id} className="basis-[85%] pl-4">
                      <ResumeCard resume={resume} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="hidden sm:block">
                  <CarouselPrevious className="absolute -left-12 top-1/2" />
                  <CarouselNext className="absolute -right-12 top-1/2" />
                </div>
              </Carousel>
            </div>
          )}
        </div>

        {/* Desktop Grid View */}
        <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {canCreateMore ? <CreateResumeCard /> : <LimitReachedCard />}

          {paginatedResumes.map((resume) => (
            <ResumeCard key={resume.id} resume={resume} />
          ))}
          {optimisticCopiedResumes.length === 0 &&
            optimisticCopiedResumes.length + 1 < 4 && (
              <div className="col-span-2 md:col-span-1" />
            )}
        </div>
      </div>

      {/* Rename Dialog */}
      <Dialog
        open={!!renamingResume}
        onOpenChange={(open) => !open && setRenamingResume(null)}
      >
        <DialogContent className="sm:max-w-md bg-white border border-gray-200 shadow-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-gray-900">
              Rename Resume
            </DialogTitle>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRenameResume();
            }}
            placeholder="Resume name"
            autoFocus
            className="h-9 border-gray-200 focus:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenamingResume(null)}
              className="border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors duration-150"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRenameResume}
              disabled={!renameValue.trim()}
              className="bg-gray-900 text-white hover:bg-gray-700 transition-colors duration-150"
            >
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
