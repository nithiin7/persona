"use client";

import React from "react";
import { Resume, Profile, Job } from "@/lib/types";
import { useState, useEffect, useReducer, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { ResumeContext, resumeReducer } from "./resume-editor-context";
import { createClient } from "@/utils/supabase/client";
import { EditorLayout } from "./layout/EditorLayout";
import { EditorPanel } from "./panels/editor-panel";
import { PreviewPanel } from "./panels/preview-panel";
import { UnsavedChangesDialog } from "./dialogs/unsaved-changes-dialog";
import { updateResume } from "@/utils/actions/resumes/actions";
import { toast } from "@/hooks/use-toast";

interface ResumeEditorClientProps {
  initialResume: Resume;
  profile: Profile;
  initialJob?: Job | null;
}

export function ResumeEditorClient({
  initialResume,
  profile,
  initialJob,
}: ResumeEditorClientProps) {
  const router = useRouter();
  const [state, dispatch] = useReducer(resumeReducer, {
    resume: initialResume,
    isSaving: false,
    isDeleting: false,
    hasUnsavedChanges: false,
  });

  const [showExitDialog, setShowExitDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null
  );

  // Refs used inside stable effects to avoid re-patching history on every render
  const hasUnsavedChangesRef = useRef(false);
  const historyGuardAddedRef = useRef(false);

  const debouncedResume = useDebouncedValue(state.resume, 100);
  const [job, setJob] = useState<Job | null>(initialJob ?? null);
  const [isLoadingJob, setIsLoadingJob] = useState(false);

  // Single job fetching effect
  useEffect(() => {
    if (!state.resume.job_id) {
      setJob(null);
      setIsLoadingJob(false);
      return;
    }

    if (job?.id === state.resume.job_id) {
      return;
    }

    let isCancelled = false;

    async function fetchJob() {
      try {
        setIsLoadingJob(true);
        const supabase = createClient();
        const { data: jobData, error } = await supabase
          .from("jobs")
          .select("*")
          .eq("id", state.resume.job_id)
          .single();

        if (isCancelled) {
          return;
        }

        if (error) {
          void error;
          setJob(null);
          return;
        }

        setJob(jobData);
      } catch {
        if (!isCancelled) {
          setJob(null);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingJob(false);
        }
      }
    }

    fetchJob();

    return () => {
      isCancelled = true;
    };
  }, [state.resume.job_id, job?.id]);

  const updateField = <K extends keyof Resume>(field: K, value: Resume[K]) => {
    if (field === "document_settings") {
      // Ensure we're passing a valid DocumentSettings object
      if (typeof value === "object" && value !== null) {
        dispatch({ type: "UPDATE_FIELD", field, value });
      } else {
        console.error("Invalid document settings:", value);
      }
    } else {
      dispatch({ type: "UPDATE_FIELD", field, value });
    }
  };

  // Sync state when the server pushes a new resume (e.g. after version restore)
  useEffect(() => {
    dispatch({ type: "SET_RESUME", value: initialResume });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialResume.updated_at]);

  // Track changes
  useEffect(() => {
    const hasChanges =
      JSON.stringify(state.resume) !== JSON.stringify(initialResume);
    dispatch({ type: "SET_HAS_CHANGES", value: hasChanges });
  }, [state.resume, initialResume]);

  // Keep ref in sync so stable effects can read current value
  useEffect(() => {
    hasUnsavedChangesRef.current = state.hasUnsavedChanges;
  }, [state.hasUnsavedChanges]);

  // Handle tab close / page refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [state.hasUnsavedChanges]);

  // Intercept client-side link navigation (pushState) — mounted once
  useEffect(() => {
    const currentPathname = window.location.pathname;
    const original = window.history.pushState.bind(window.history);

    window.history.pushState = (
      ...args: Parameters<typeof window.history.pushState>
    ) => {
      const [data, unused, url] = args;
      if (hasUnsavedChangesRef.current && url) {
        const target = new URL(url.toString(), window.location.href);
        if (target.pathname !== currentPathname) {
          setPendingNavigation(target.pathname + target.search);
          setShowExitDialog(true);
          return;
        }
      }
      original(data, unused, url);
    };

    return () => {
      window.history.pushState = original;
    };
  }, []);

  // Intercept browser back button (popstate) — mounted once
  useEffect(() => {
    const handlePopState = () => {
      if (!hasUnsavedChangesRef.current) return;
      // Re-add a guard entry so back button stays blocked
      window.history.pushState(null, "", window.location.href);
      setPendingNavigation("__back__");
      setShowExitDialog(true);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Add a history guard entry when unsaved changes first appear
  useEffect(() => {
    if (state.hasUnsavedChanges && !historyGuardAddedRef.current) {
      window.history.pushState(null, "", window.location.href);
      historyGuardAddedRef.current = true;
    }
    if (!state.hasUnsavedChanges) {
      historyGuardAddedRef.current = false;
    }
  }, [state.hasUnsavedChanges]);

  // Editor Panel
  const editorPanel = (
    <EditorPanel
      resume={state.resume}
      profile={profile}
      job={job}
      isLoadingJob={isLoadingJob}
      onResumeChange={updateField}
    />
  );

  // Preview Panel
  const previewPanel = (width: number) => (
    <PreviewPanel
      resume={debouncedResume}
      onResumeChange={updateField}
      width={width}
      job={job}
    />
  );

  const performNavigation = (target: string | null) => {
    // Disable the guard synchronously so the interceptor lets this navigation through
    hasUnsavedChangesRef.current = false;
    if (target === "__back__") {
      router.back();
    } else if (target) {
      router.push(target);
    }
  };

  return (
    <ResumeContext.Provider value={{ state, dispatch }}>
      {/* Unsaved Changes Dialog */}
      <UnsavedChangesDialog
        isOpen={showExitDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowExitDialog(false);
            setPendingNavigation(null);
          }
        }}
        onDiscard={() => {
          setShowExitDialog(false);
          performNavigation(pendingNavigation);
          setPendingNavigation(null);
        }}
        onSave={async () => {
          try {
            await updateResume(state.resume.id, state.resume, true);
            setShowExitDialog(false);
            performNavigation(pendingNavigation);
            setPendingNavigation(null);
          } catch (error) {
            toast({
              title: "Save failed",
              description:
                error instanceof Error
                  ? error.message
                  : "Unable to save changes. Please try again.",
              variant: "destructive",
            });
          }
        }}
      />

      {/* Editor Layout */}
      <EditorLayout
        isBaseResume={state.resume.is_base_resume}
        editorPanel={editorPanel}
        previewPanel={previewPanel}
      />
    </ResumeContext.Provider>
  );
}
