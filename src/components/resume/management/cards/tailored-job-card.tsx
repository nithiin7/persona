"use client";

import { useEffect, useState } from "react";
import {
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  Trash2,
  Loader2,
  Plus,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Job, Resume } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { updateResume } from "@/utils/actions/resumes/actions";
import { createJob, deleteJob } from "@/utils/actions/jobs/actions";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useResumeContext } from "../../editor/resume-editor-context";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { BriefcaseIcon } from "lucide-react";
import { formatJobListing } from "@/utils/actions/jobs/ai";
import { updateJobStatus } from "@/utils/actions/jobs/actions";
import type { ApplicationStatus } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_OPTIONS: {
  value: ApplicationStatus;
  label: string;
  dot: string;
}[] = [
  { value: "saved", label: "Saved", dot: "bg-gray-400" },
  { value: "applied", label: "Applied", dot: "bg-blue-500" },
  { value: "phone_screen", label: "Phone Screen", dot: "bg-amber-500" },
  { value: "onsite", label: "Onsite", dot: "bg-purple-500" },
  { value: "offer", label: "Offer", dot: "bg-emerald-500" },
  { value: "rejected", label: "Rejected", dot: "bg-red-500" },
];

function ApplicationStatusSelect({ job }: { job: Job }) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const current = job.application_status ?? "saved";

  const handleChange = async (next: string) => {
    if (next === current) return;
    setUpdating(true);
    try {
      await updateJobStatus(job.id, next as ApplicationStatus);
      router.refresh();
    } catch {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const cfg = STATUS_OPTIONS.find((o) => o.value === current);

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
        Status
      </span>
      <Select value={current} onValueChange={handleChange} disabled={updating}>
        <SelectTrigger className="h-7 text-xs border border-gray-200 rounded-full px-3 bg-white focus:ring-gray-300/40">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                cfg?.dot ?? "bg-gray-400"
              )}
            />
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              <div className="flex items-center gap-2">
                <span className={cn("w-1.5 h-1.5 rounded-full", opt.dot)} />
                {opt.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface TailoredJobCardProps {
  jobId: string | null;
  job?: Job | null;
  isLoading?: boolean;
}

export function TailoredJobCard({
  jobId,
  job: externalJob,
  isLoading: externalIsLoading,
}: TailoredJobCardProps) {
  const router = useRouter();
  const { state, dispatch } = useResumeContext();

  const [internalJob, setInternalJob] = useState<Job | null>(null);
  const [internalIsLoading, setInternalIsLoading] = useState(true);

  const effectiveJob = externalJob ?? internalJob;
  const effectiveIsLoading = externalIsLoading ?? internalIsLoading;

  useEffect(() => {
    if (externalJob !== undefined) return;

    async function fetchJob() {
      if (!jobId) {
        setInternalJob(null);
        setInternalIsLoading(false);
        return;
      }

      try {
        setInternalIsLoading(true);
        const supabase = createClient();
        const { data: jobData, error } = await supabase
          .from("jobs")
          .select("*")
          .eq("id", jobId)
          .single();

        if (error) {
          if (error.code !== "PGRST116") throw error;
          setInternalJob(null);
          return;
        }

        setInternalJob(jobData);
      } catch (error) {
        console.error("Error fetching job:", error);
        if (error instanceof Error && error.message !== "No rows returned") {
          setInternalJob(null);
        }
      } finally {
        setInternalIsLoading(false);
      }
    }

    fetchJob();
  }, [jobId, externalJob]);

  const [isCreating, setIsCreating] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [isFormatting, setIsFormatting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    jobDescription?: string;
  }>({});

  const formatWorkLocation = (workLocation: Job["work_location"]) => {
    if (!workLocation) return "Not specified";
    return workLocation.replace("_", " ");
  };

  const validateJobDescription = (value: string) => {
    const errors: { jobDescription?: string } = {};
    if (!value.trim()) {
      errors.jobDescription = "Job description is required";
    } else if (value.trim().length < 50) {
      errors.jobDescription =
        "Job description should be at least 50 characters";
    }
    return errors;
  };

  const handleJobDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setJobDescription(value);
    setValidationErrors(validateJobDescription(value));
  };

  const handleCreateJobWithAI = async () => {
    const errors = validateJobDescription(jobDescription);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast({
        title: "Validation Error",
        description: errors.jobDescription,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsFormatting(true);

      const MODEL_STORAGE_KEY = "persona-default-model";
      const LOCAL_STORAGE_KEY = "persona-api-keys";

      const selectedModel = localStorage.getItem(MODEL_STORAGE_KEY);
      const storedKeys = localStorage.getItem(LOCAL_STORAGE_KEY);
      let apiKeys = [];

      try {
        apiKeys = storedKeys ? JSON.parse(storedKeys) : [];
      } catch (error) {
        console.error("Error parsing API keys:", error);
      }

      const formattedJob = await formatJobListing(jobDescription, {
        model: selectedModel || "",
        apiKeys,
      });

      setIsFormatting(false);
      setIsCreating(true);

      const newJob = await createJob(formattedJob);

      dispatch({ type: "UPDATE_FIELD", field: "job_id", value: newJob.id });

      await updateResume(state.resume.id, {
        ...state.resume,
        job_id: newJob.id,
      });

      setCreateDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error creating job:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create job",
        variant: "destructive",
      });
    } finally {
      setIsFormatting(false);
      setIsCreating(false);
      setJobDescription("");
    }
  };

  const LoadingSkeleton = () => (
    <div
      className="space-y-3 p-4"
      role="status"
      aria-label="Loading job details"
    >
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-3.5 w-3.5 rounded-full bg-gray-100 animate-pulse shrink-0" />
            <div className="h-3 flex-1 bg-gray-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="h-7 w-48 bg-gray-100 rounded-full animate-pulse" />
      <div className="space-y-1.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-3 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );

  const ErrorState = () => (
    <div
      className="flex flex-col items-center justify-center p-8 gap-3 text-center"
      role="alert"
      aria-live="polite"
    >
      <div className="p-3 rounded-full bg-gray-100">
        <AlertCircle className="w-5 h-5 text-gray-400" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">
          Unable to Load Job
        </h3>
        <p className="text-sm text-gray-500">
          This job listing is no longer available.
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={() => router.refresh()}>
        Try Again
      </Button>
    </div>
  );

  if (!jobId) {
    return (
      <div className="p-6 flex flex-col items-center gap-4 text-center">
        <div className="p-3 rounded-full bg-gray-100">
          <Plus className="w-5 h-5 text-gray-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            No Job Linked
          </h3>
          <p className="text-sm text-gray-500 max-w-xs">
            Link a job listing to tailor your resume and track your application.
          </p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Job Listing
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[600px]">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Add Job Listing
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Paste the job description and AI will extract the details
              automatically.
            </DialogDescription>

            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Textarea
                  placeholder="Paste the job description here..."
                  value={jobDescription}
                  onChange={handleJobDescriptionChange}
                  className={cn(
                    "min-h-[200px] text-sm",
                    validationErrors.jobDescription
                      ? "border-red-300 focus:border-red-400"
                      : "border-gray-200"
                  )}
                  aria-invalid={!!validationErrors.jobDescription}
                  aria-describedby="job-description-error"
                />
                {validationErrors.jobDescription && (
                  <Alert variant="destructive" role="alert">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription id="job-description-error">
                      {validationErrors.jobDescription}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateJobWithAI}
                  disabled={
                    isFormatting ||
                    isCreating ||
                    !!validationErrors.jobDescription
                  }
                  aria-busy={isFormatting || isCreating}
                >
                  {isFormatting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                      Formatting…
                    </>
                  ) : isCreating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 mr-2" />
                      Create with AI
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {effectiveIsLoading ? (
          <LoadingSkeleton />
        ) : effectiveJob ? (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="p-4 space-y-4"
          >
            {/* Metadata grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {[
                {
                  icon: MapPin,
                  text: effectiveJob.location || "Location not specified",
                },
                {
                  icon: Briefcase,
                  text: formatWorkLocation(effectiveJob.work_location),
                },
                {
                  icon: DollarSign,
                  text: effectiveJob.salary_range || "Salary not specified",
                },
                {
                  icon: Clock,
                  text:
                    effectiveJob.employment_type?.replace("_", " ") ||
                    "Employment type not specified",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm text-gray-500"
                >
                  <item.icon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="capitalize truncate">{item.text}</span>
                </div>
              ))}
            </div>

            {/* Application status */}
            <ApplicationStatusSelect job={effectiveJob} />

            {/* Description */}
            {effectiveJob.description && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Description
                </p>
                <p className="text-sm text-gray-500 whitespace-pre-wrap leading-relaxed">
                  {effectiveJob.description}
                </p>
              </div>
            )}

            {/* Keywords */}
            {effectiveJob.keywords && effectiveJob.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {effectiveJob.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <ErrorState />
        )}
      </AnimatePresence>
    </div>
  );
}

interface TailoredJobAccordionProps {
  resume: Resume;
  job: Job | null;
  isLoading?: boolean;
}

export function TailoredJobAccordion({
  resume,
  job,
  isLoading,
}: TailoredJobAccordionProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  if (resume.is_base_resume) return null;

  const title = job?.position_title || "Target Job";
  const company = job?.company_name;

  const handleDelete = async () => {
    if (!resume.job_id) return;

    try {
      setIsDeleting(true);
      await deleteJob(resume.job_id);
      router.refresh();
    } catch (error) {
      console.error("Error deleting job:", error);
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AccordionItem
      value="job"
      className="mb-4 border border-gray-200 rounded-lg bg-white"
    >
      <div className="px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-gray-100">
              <BriefcaseIcon className="h-3.5 w-3.5 text-gray-500" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium text-gray-900">{title}</span>
              {company && (
                <span className="text-xs text-gray-500">{company}</span>
              )}
            </div>
          </div>
        </AccordionTrigger>
      </div>

      <AccordionContent className="border-t border-gray-100">
        <TailoredJobCard
          jobId={resume.job_id || null}
          job={job}
          isLoading={isLoading}
        />
        {job && (
          <div className="flex justify-end px-4 pb-3">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-gray-400 hover:text-red-500 hover:bg-red-50 gap-1.5 text-xs"
            >
              {isDeleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Delete Job
            </Button>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
