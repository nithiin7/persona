"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Profile, ResumeSummary } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Plus, Brain, Copy } from "lucide-react";
import {
  createTailoredResume,
  getResumeById,
} from "@/utils/actions/resumes/actions";
import { CreateBaseResumeDialog } from "./create-base-resume-dialog";
import { tailorResumeToJob } from "@/utils/actions/jobs/ai";
import { formatJobListing } from "@/utils/actions/jobs/ai";
import { createJob } from "@/utils/actions/jobs/actions";
import { MiniResumePreview } from "../../shared/mini-resume-preview";
import { LoadingOverlay, type CreationStep } from "../loading-overlay";
import { BaseResumeSelector } from "../base-resume-selector";
import { ImportMethodRadioGroup } from "../import-method-radio-group";
import { JobDescriptionInput } from "../job-description-input";
import { ApiErrorDialog } from "@/components/ui/api-error-dialog";
import { cn } from "@/lib/utils";

interface CreateTailoredResumeDialogProps {
  children: React.ReactNode;
  baseResumes?: ResumeSummary[];
  profile?: Profile;
}

export function CreateTailoredResumeDialog({
  children,
  baseResumes,
  profile,
}: CreateTailoredResumeDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedBaseResume, setSelectedBaseResume] = useState<string>(
    baseResumes?.[0]?.id || ""
  );
  const [jobDescription, setJobDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [currentStep, setCurrentStep] = useState<CreationStep>("analyzing");
  const [dialogStep, setDialogStep] = useState<1 | 2>(1);
  const [importOption, setImportOption] = useState<"import-profile" | "ai">(
    "ai"
  );
  const [isBaseResumeInvalid, setIsBaseResumeInvalid] = useState(false);
  const [isJobDescriptionInvalid, setIsJobDescriptionInvalid] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState({
    title: "",
    description: "",
  });
  const router = useRouter();

  const handleNext = () => {
    if (!selectedBaseResume) {
      setIsBaseResumeInvalid(true);
      toast({
        title: "Required Field Missing",
        description: "Please select a base resume to continue.",
        variant: "destructive",
      });
      return;
    }
    setDialogStep(2);
  };

  const handleBack = () => setDialogStep(1);

  const handleCreate = async () => {
    if (!selectedBaseResume) {
      setIsBaseResumeInvalid(true);
      toast({
        title: "Error",
        description: "Please select a base resume",
        variant: "destructive",
      });
      return;
    }
    if (!jobDescription.trim() && importOption === "ai") {
      setIsJobDescriptionInvalid(true);
      toast({
        title: "Error",
        description: "Please enter a job description",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);
      setCurrentStep("analyzing");
      setIsBaseResumeInvalid(false);
      setIsJobDescriptionInvalid(false);

      const MODEL_STORAGE_KEY = "persona-default-model";
      const LOCAL_STORAGE_KEY = "persona-api-keys";
      const selectedModel = localStorage.getItem(MODEL_STORAGE_KEY);
      const storedKeys = localStorage.getItem(LOCAL_STORAGE_KEY);
      let apiKeys = [];
      try {
        apiKeys = storedKeys ? JSON.parse(storedKeys) : [];
      } catch {
        /* ignore */
      }

      if (importOption === "import-profile") {
        const { resume: baseResume } = await getResumeById(selectedBaseResume);
        if (!baseResume) throw new Error("Base resume not found");

        let jobId: string | null = null;
        let jobTitle = "Copied Resume";
        let companyName = "";

        if (jobDescription.trim()) {
          try {
            setCurrentStep("analyzing");
            const formattedJobListing = await formatJobListing(jobDescription, {
              model: selectedModel || "",
              apiKeys,
            });
            setCurrentStep("formatting");
            const jobEntry = await createJob(formattedJobListing);
            if (!jobEntry?.id) throw new Error("Failed to create job entry");
            jobId = jobEntry.id;
            jobTitle = formattedJobListing.position_title || "Copied Resume";
            companyName = formattedJobListing.company_name || "";
          } catch (error: Error | unknown) {
            const isKeyError =
              error instanceof Error &&
              (error.message.toLowerCase().includes("api key") ||
                error.message.toLowerCase().includes("unauthorized") ||
                error.message.toLowerCase().includes("invalid key"));
            setErrorMessage(
              isKeyError
                ? {
                    title: "API Key Error",
                    description:
                      "There was an issue with your API key. Please check your settings and try again.",
                  }
                : {
                    title: "Error",
                    description:
                      "Failed to process job description. Please try again.",
                  }
            );
            setShowErrorDialog(true);
            setIsCreating(false);
            return;
          }
        }

        const resume = await createTailoredResume(
          baseResume,
          jobId,
          jobTitle,
          companyName,
          {
            work_experience: baseResume.work_experience,
            education: baseResume.education.map((edu) => ({
              ...edu,
              gpa: edu.gpa?.toString(),
            })),
            skills: baseResume.skills,
            projects: baseResume.projects,
            target_role: baseResume.target_role,
          }
        );

        toast({ title: "Success", description: "Resume created successfully" });
        router.push(`/resumes/${resume.id}`);
        setOpen(false);
        return;
      }

      // AI tailoring path
      let formattedJobListing;
      try {
        formattedJobListing = await formatJobListing(jobDescription, {
          model: selectedModel || "",
          apiKeys,
        });
      } catch (error: Error | unknown) {
        const isKeyError =
          error instanceof Error &&
          (error.message.toLowerCase().includes("api key") ||
            error.message.toLowerCase().includes("unauthorized") ||
            error.message.toLowerCase().includes("invalid key"));
        setErrorMessage(
          isKeyError
            ? {
                title: "API Key Error",
                description:
                  "There was an issue with your API key. Please check your settings and try again.",
              }
            : {
                title: "Error",
                description:
                  "Failed to analyze job description. Please try again.",
              }
        );
        setShowErrorDialog(true);
        setIsCreating(false);
        return;
      }

      setCurrentStep("formatting");
      const jobEntry = await createJob(formattedJobListing);
      if (!jobEntry?.id) throw new Error("Failed to create job entry");

      const { resume: baseResume } = await getResumeById(selectedBaseResume);
      if (!baseResume) throw new Error("Base resume not found");

      setCurrentStep("tailoring");

      let tailoredContent;
      try {
        tailoredContent = await tailorResumeToJob(
          baseResume,
          formattedJobListing,
          { model: selectedModel || "", apiKeys },
          profile
        );
      } catch (error: Error | unknown) {
        const isKeyError =
          error instanceof Error &&
          (error.message.toLowerCase().includes("api key") ||
            error.message.toLowerCase().includes("unauthorized") ||
            error.message.toLowerCase().includes("invalid key"));
        setErrorMessage(
          isKeyError
            ? {
                title: "API Key Error",
                description:
                  "There was an issue with your API key. Please check your settings and try again.",
              }
            : {
                title: "Error",
                description: "Failed to tailor resume. Please try again.",
              }
        );
        setShowErrorDialog(true);
        setIsCreating(false);
        return;
      }

      setCurrentStep("finalizing");

      const resume = await createTailoredResume(
        baseResume,
        jobEntry.id,
        formattedJobListing.position_title || "",
        formattedJobListing.company_name || "",
        tailoredContent
      );

      toast({ title: "Success", description: "Resume created successfully" });
      router.push(`/resumes/${resume.id}`);
      setOpen(false);
    } catch (error: unknown) {
      console.error("Failed to create resume:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create resume",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      setJobDescription("");
      setDialogStep(1);
      setImportOption("ai");
      setSelectedBaseResume(baseResumes?.[0]?.id || "");
    }
  };

  // Empty state — no base resumes
  if (!baseResumes || baseResumes.length === 0) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[440px] bg-white border border-gray-200 shadow-md rounded-xl">
          <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
            <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-gray-400" />
            </div>
            <div className="space-y-1.5">
              <DialogTitle className="text-base font-semibold text-gray-900">
                No Base Resumes Found
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 max-w-xs mx-auto">
                Create a base resume first before tailoring it to a specific
                job.
              </DialogDescription>
            </div>
            {profile ? (
              <CreateBaseResumeDialog profile={profile}>
                <Button className="bg-gray-900 hover:bg-gray-700 text-white transition-colors duration-150">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Base Resume
                </Button>
              </CreateBaseResumeDialog>
            ) : (
              <Button disabled>No profile available</Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[760px] p-0 max-h-[90vh] overflow-y-auto bg-white border border-gray-200 shadow-lg rounded-xl">
          {/* Header — pr-12 leaves room for the Dialog close button */}
          <div className="px-6 pr-12 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-violet-600" />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-base font-semibold text-gray-900">
                  Create Tailored Resume
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500 mt-0.5">
                  {dialogStep === 1
                    ? "Choose a base resume to start with"
                    : "Configure job details and tailoring method"}
                </DialogDescription>
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-1.5 shrink-0">
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold transition-colors duration-150",
                    dialogStep >= 1
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-400"
                  )}
                >
                  1
                </div>
                <div
                  className={cn(
                    "w-5 h-px transition-colors duration-150",
                    dialogStep >= 2 ? "bg-gray-900" : "bg-gray-200"
                  )}
                />
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold transition-colors duration-150",
                    dialogStep >= 2
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-400"
                  )}
                >
                  2
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-5 min-h-[380px] relative">
            {isCreating && <LoadingOverlay currentStep={currentStep} />}

            {/* Step 1 — Choose base resume */}
            {dialogStep === 1 && (
              <div className="space-y-5">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Choose Your Foundation
                  </h3>
                  <p className="text-xs text-gray-500">
                    Select a base resume to tailor for this opportunity.
                  </p>
                </div>
                <BaseResumeSelector
                  baseResumes={baseResumes}
                  selectedResumeId={selectedBaseResume}
                  onResumeSelect={setSelectedBaseResume}
                  isInvalid={isBaseResumeInvalid}
                />
              </div>
            )}

            {/* Step 2 — Job details + method */}
            {dialogStep === 2 && (
              <div className="space-y-5">
                {/* Selected resume pill */}
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  <MiniResumePreview
                    name={
                      baseResumes.find((r) => r.id === selectedBaseResume)
                        ?.name || ""
                    }
                    type="base"
                    className="w-8 h-8 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-[11px] text-gray-400 leading-none mb-0.5">
                      Foundation
                    </p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {
                        baseResumes.find((r) => r.id === selectedBaseResume)
                          ?.name
                      }
                    </p>
                  </div>
                </div>

                {/* Job description */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-700">
                      Job Information
                    </span>
                    <span className="text-red-400 text-xs">*</span>
                  </div>
                  <JobDescriptionInput
                    value={jobDescription}
                    onChange={setJobDescription}
                    isInvalid={isJobDescriptionInvalid}
                  />
                </div>

                {/* Tailoring method */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-gray-700">
                    Tailoring Method
                  </span>
                  <ImportMethodRadioGroup
                    value={importOption}
                    onChange={setImportOption}
                  />
                </div>

                {/* Method description */}
                {importOption === "ai" && (
                  <div className="flex items-start gap-3 bg-violet-50 border border-violet-200 rounded-lg px-3 py-3">
                    <div className="h-7 w-7 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                      <Brain className="w-3.5 h-3.5 text-violet-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-violet-800">
                        AI Tailoring
                      </p>
                      <ul className="space-y-0.5 text-xs text-violet-700">
                        <li>• Analyzes job requirements and keywords</li>
                        <li>• Optimizes your experience descriptions</li>
                        <li>• Highlights relevant skills and achievements</li>
                      </ul>
                    </div>
                  </div>
                )}

                {importOption === "import-profile" && (
                  <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-3">
                    <div className="h-7 w-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-700">
                        Direct Copy
                      </p>
                      <ul className="space-y-0.5 text-xs text-gray-500">
                        <li>• Creates an exact copy of your base resume</li>
                        <li>• Links it to the job posting for organization</li>
                        <li>• You can manually edit it afterwards</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/60">
            <div className="flex items-center justify-between">
              <div>
                {dialogStep === 2 && (
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    size="sm"
                    className="border-gray-200 text-gray-600 hover:bg-white transition-colors duration-150"
                  >
                    Back
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  size="sm"
                  className="border-gray-200 text-gray-600 hover:bg-white transition-colors duration-150"
                >
                  Cancel
                </Button>
                {dialogStep === 1 && (
                  <Button
                    onClick={handleNext}
                    size="sm"
                    className="bg-gray-900 hover:bg-gray-700 text-white transition-colors duration-150"
                  >
                    Next
                  </Button>
                )}
                {dialogStep === 2 && (
                  <Button
                    onClick={handleCreate}
                    disabled={isCreating}
                    size="sm"
                    className="bg-gray-900 hover:bg-gray-700 text-white transition-colors duration-150"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        Creating…
                      </>
                    ) : (
                      "Create Resume"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ApiErrorDialog
        open={showErrorDialog}
        onOpenChange={setShowErrorDialog}
        errorMessage={errorMessage}
        onUpgrade={() => {
          setShowErrorDialog(false);
          window.location.href = "/subscription";
        }}
        onSettings={() => {
          setShowErrorDialog(false);
          window.location.href = "/settings";
        }}
      />
    </>
  );
}
