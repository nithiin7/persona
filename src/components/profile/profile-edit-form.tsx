"use client";

import {
  Profile,
  WorkExperience,
  Education,
  Project,
  Certification,
} from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  User,
  Linkedin,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Upload,
  Save,
  Trash2,
  Award,
  Sparkles,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { ProfileBasicInfoForm } from "@/components/profile/profile-basic-info-form";
import { ProfileWorkExperienceForm } from "@/components/profile/profile-work-experience-form";
import { ProfileProjectsForm } from "@/components/profile/profile-projects-form";
import { ProfileEducationForm } from "@/components/profile/profile-education-form";
import { ProfileSkillsForm } from "@/components/profile/profile-skills-form";
import { ProfileCertificationsForm } from "@/components/profile/profile-certifications-form";
import { formatProfileWithAI } from "../../utils/actions/profiles/ai";
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

import { AlertTriangle } from "lucide-react";
import { importResume, updateProfile } from "@/utils/actions/profiles/actions";
import { cn, calculateProfileCompleteness } from "@/lib/utils";
import pdfToText from "react-pdftotext";

interface ProfileEditFormProps {
  profile: Profile;
}

export function ProfileEditForm({
  profile: initialProfile,
}: ProfileEditFormProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isResumeDialogOpen, setIsResumeDialogOpen] = useState(false);
  const [isTextImportDialogOpen, setIsTextImportDialogOpen] = useState(false);
  const [resumeContent, setResumeContent] = useState("");
  const [textImportContent, setTextImportContent] = useState("");
  const [isProcessingResume, setIsProcessingResume] = useState(false);
  const [apiKeyError, setApiKeyError] = useState("");
  const [isResumeDragging, setIsResumeDragging] = useState(false);
  const [isTextImportDragging, setIsTextImportDragging] = useState(false);
  const router = useRouter();

  const { score, missing } = calculateProfileCompleteness(profile);
  const scoreColor =
    score >= 80
      ? "text-emerald-600"
      : score >= 50
        ? "text-amber-600"
        : "text-red-600";
  const barColor =
    score >= 80
      ? "bg-emerald-500"
      : score >= 50
        ? "bg-amber-500"
        : "bg-red-500";

  // Sync with server state when initialProfile changes
  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  // Add useEffect to clear error when dialogs close
  useEffect(() => {
    if (!isResumeDialogOpen && !isTextImportDialogOpen) {
      setApiKeyError("");
    }
  }, [isResumeDialogOpen, isTextImportDialogOpen]);

  const updateField = (field: keyof Profile, value: unknown) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await updateProfile(profile);
      toast.success("Changes saved successfully");
      // Force a server revalidation
      router.refresh();
    } catch (error) {
      void error;
      toast.error("Unable to save your changes. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async () => {
    try {
      setIsResetting(true);
      // Reset to empty profile locally
      const resetProfile = {
        id: profile.id,
        user_id: profile.user_id,
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        location: "",
        website: "",
        linkedin_url: "",
        github_url: "",
        work_experience: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      };

      // Update local state
      setProfile(resetProfile);

      // Save to database
      await updateProfile(resetProfile);

      toast.success("Profile reset successfully");

      // Force a server revalidation
      router.refresh();
    } catch (error: unknown) {
      toast.error("Failed to reset profile. Please try again.");
      console.error(error);
    } finally {
      setIsResetting(false);
    }
  };

  const handleLinkedInImport = () => {
    toast.info("LinkedIn import feature coming soon!");
  };

  const handleResumeUpload = async (content: string) => {
    try {
      setIsProcessingResume(true);

      // Get model and API key from local storage
      const MODEL_STORAGE_KEY = "persona-default-model";
      const LOCAL_STORAGE_KEY = "persona-api-keys";

      const selectedModel =
        localStorage.getItem(MODEL_STORAGE_KEY) || "claude-sonnet-4-20250514";
      const storedKeys = localStorage.getItem(LOCAL_STORAGE_KEY);
      let apiKeys = [];

      try {
        apiKeys = storedKeys ? JSON.parse(storedKeys) : [];
      } catch (error) {
        console.error("Error parsing API keys:", error);
      }

      const result = await formatProfileWithAI(content, {
        model: selectedModel,
        apiKeys,
      });

      if (result) {
        // Clean and transform the data to match our database schema
        const cleanedProfile: Partial<Profile> = {
          first_name: result.first_name || null,
          last_name: result.last_name || null,
          email: result.email || null,
          phone_number: result.phone_number || null,
          location: result.location || null,
          website: result.website || null,
          linkedin_url: result.linkedin_url || null,
          github_url: result.github_url || null,
          work_experience: Array.isArray(result.work_experience)
            ? result.work_experience.map((exp: Partial<WorkExperience>) => ({
                company: exp.company || "",
                position: exp.position || "",
                location: exp.location || "",
                date: exp.date || "",
                description: Array.isArray(exp.description)
                  ? exp.description
                  : [exp.description || ""],
                technologies: Array.isArray(exp.technologies)
                  ? exp.technologies
                  : [],
              }))
            : [],
          education: Array.isArray(result.education)
            ? result.education.map((edu: Partial<Education>) => ({
                school: edu.school || "",
                degree: edu.degree || "",
                field: edu.field || "",
                location: edu.location || "",
                date: edu.date || "",
                gpa: edu.gpa ? parseFloat(edu.gpa.toString()) : undefined,
                achievements: Array.isArray(edu.achievements)
                  ? edu.achievements
                  : [],
              }))
            : [],
          skills: Array.isArray(result.skills)
            ? result.skills.map(
                (skill: {
                  category: string;
                  skills?: string[];
                  items?: string[];
                }) => ({
                  category: skill.category || "",
                  items: Array.isArray(skill.skills)
                    ? skill.skills
                    : Array.isArray(skill.items)
                      ? skill.items
                      : [],
                })
              )
            : [],
          projects: Array.isArray(result.projects)
            ? result.projects.map((proj: Partial<Project>) => ({
                name: proj.name || "",
                description: Array.isArray(proj.description)
                  ? proj.description
                  : [proj.description || ""],
                technologies: Array.isArray(proj.technologies)
                  ? proj.technologies
                  : [],
                url: proj.url || undefined,
                github_url: proj.github_url || undefined,
                date: proj.date || "",
              }))
            : [],
          certifications: Array.isArray(result.certifications)
            ? result.certifications.map((cert: Partial<Certification>) => ({
                name: cert.name || "",
                provider: cert.provider || "",
                date: cert.date || undefined,
                credential_id: cert.credential_id || undefined,
                credential_url: cert.credential_url || undefined,
              }))
            : [],
        };

        await importResume(cleanedProfile);

        setProfile((prev) => ({
          ...prev,
          ...cleanedProfile,
        }));
        toast.success("Content imported — don't forget to save your changes");
        setIsResumeDialogOpen(false);
        setIsTextImportDialogOpen(false);
        setResumeContent("");
        setTextImportContent("");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Resume upload error:", error);
        if (error.message.toLowerCase().includes("api key")) {
          setApiKeyError(
            "API key required. Please add your OpenAI API key in settings or upgrade to our Pro Plan."
          );
        } else {
          toast.error("Failed to process content: " + error.message);
        }
      }
    } finally {
      setIsProcessingResume(false);
    }
  };

  // Add drag event handlers
  const handleDrag = (
    e: React.DragEvent,
    isDraggingState: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      isDraggingState(true);
    } else if (e.type === "dragleave") {
      isDraggingState(false);
    }
  };

  const handleDrop = async (
    e: React.DragEvent,
    setContent: React.Dispatch<React.SetStateAction<string>>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResumeDragging(false);
    setIsTextImportDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find((file) => file.type === "application/pdf");

    if (pdfFile) {
      try {
        const text = await pdfToText(pdfFile);
        setContent((prev) => prev + (prev ? "\n\n" : "") + text);
      } catch (error) {
        console.error("PDF processing error:", error);
        toast.error(
          "Failed to extract text from the PDF. Please try again or paste the content manually."
        );
      }
    } else {
      toast.error("Please drop a PDF file.");
    }
  };

  const handleFileInput = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setContent: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      try {
        const text = await pdfToText(file);
        setContent((prev) => prev + (prev ? "\n\n" : "") + text);
      } catch (error) {
        console.error("PDF processing error:", error);
        toast.error(
          "Failed to extract text from the PDF. Please try again or paste the content manually."
        );
      }
    }
  };

  return (
    <div className="relative mx-auto animate-fade-in">
      {/* Action Bar */}
      <div className="border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-gray-700">
          Profile Editor
        </span>

        <div className="flex items-center gap-2">
          {/* Reset Profile Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-red-600 border-gray-200 hover:bg-red-50 hover:border-red-200 transition-colors duration-200"
                disabled={isResetting}
              >
                {isResetting ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                )}
                {isResetting ? "Resetting..." : "Reset"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-[425px]">
              <AlertDialogHeader>
                <AlertDialogTitle>Reset Profile</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to reset your profile? This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isResetting}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleReset}
                  disabled={isResetting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isResetting ? "Resetting..." : "Reset Profile"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Save Button */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            size="sm"
            className="h-8 bg-gray-900 text-white hover:bg-gray-700 transition-colors duration-200"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="mr-2 h-3.5 w-3.5" />
            )}
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Main content container */}
      <div className="relative px-4 sm:px-6 lg:px-8 pb-10 pt-6">
        {/* Profile Completion Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5 animate-fade-up">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Profile Completion
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {score === 100
                  ? "Your profile is complete!"
                  : `${missing.length} section${missing.length !== 1 ? "s" : ""} still need attention`}
              </p>
            </div>
            <span className={cn("text-2xl font-bold tabular-nums", scoreColor)}>
              {score}%
            </span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700 ease-out",
                barColor
              )}
              style={{ width: `${score}%` }}
            />
          </div>
          {missing.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {missing.map((m) => (
                <span
                  key={m}
                  className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full"
                >
                  {m}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Import Actions Row */}
        <div
          className="bg-white border border-gray-200 rounded-xl p-4 mb-5 animate-fade-up"
          style={{ animationDelay: "60ms" }}
        >
          <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">
            Import Options
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* LinkedIn Import Button */}
            <Button
              variant="outline"
              onClick={handleLinkedInImport}
              className="justify-start gap-3 h-auto py-3 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0077b5]/10 shrink-0">
                <Linkedin className="h-4 w-4 text-[#0077b5]" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-800">
                  LinkedIn
                </div>
                <div className="text-xs text-gray-400">Import from profile</div>
              </div>
            </Button>

            {/* Resume Upload Button */}
            <Dialog
              open={isResumeDialogOpen}
              onOpenChange={setIsResumeDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-start gap-3 h-auto py-3 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-50 shrink-0">
                    <Upload className="h-4 w-4 text-violet-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-800">
                      Upload Resume
                    </div>
                    <div className="text-xs text-gray-400">Import from PDF</div>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[560px] p-0 bg-white border border-gray-200 shadow-md rounded-xl overflow-hidden">
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
                  <DialogTitle className="text-base font-semibold text-gray-900">
                    Upload Resume
                  </DialogTitle>
                  <DialogDescription className="text-xs text-gray-500 mt-0.5">
                    AI will analyze your resume and add new information to your
                    profile. Existing data is preserved.
                  </DialogDescription>
                </DialogHeader>
                <div className="px-6 py-5 space-y-4">
                  <label
                    onDragEnter={(e) => handleDrag(e, setIsResumeDragging)}
                    onDragLeave={(e) => handleDrag(e, setIsResumeDragging)}
                    onDragOver={(e) => handleDrag(e, setIsResumeDragging)}
                    onDrop={(e) => handleDrop(e, setResumeContent)}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2.5 transition-colors duration-150 cursor-pointer",
                      isResumeDragging
                        ? "border-violet-400 bg-violet-50"
                        : "border-gray-200 hover:border-violet-200 hover:bg-violet-50/40"
                    )}
                  >
                    <input
                      type="file"
                      className="hidden"
                      accept="application/pdf"
                      onChange={(e) => handleFileInput(e, setResumeContent)}
                    />
                    <div className="h-10 w-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center">
                      <Upload className="h-5 w-5 text-violet-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">
                        Drop your PDF resume here
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        or click to browse files
                      </p>
                    </div>
                  </label>
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-gray-500">
                      Or paste your resume text
                    </p>
                    <Textarea
                      value={resumeContent}
                      onChange={(e) => setResumeContent(e.target.value)}
                      placeholder="Paste your resume content here..."
                      className="min-h-[100px] bg-white border-gray-200 text-sm placeholder:text-gray-400 focus:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                    />
                  </div>
                </div>
                {apiKeyError && (
                  <div className="mx-6 mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-700">
                        API Key Required
                      </p>
                      <p className="text-xs text-red-500 mt-0.5">
                        {apiKeyError}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => (window.location.href = "/settings")}
                      >
                        Go to Settings
                      </Button>
                    </div>
                  </div>
                )}
                <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50/60">
                  <Button
                    variant="outline"
                    onClick={() => setIsResumeDialogOpen(false)}
                    className="border-gray-200 text-gray-600 hover:bg-white transition-colors duration-150"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleResumeUpload(resumeContent)}
                    disabled={isProcessingResume || !resumeContent.trim()}
                    className="bg-gray-900 hover:bg-gray-700 text-white transition-colors duration-150"
                  >
                    {isProcessingResume ? (
                      <>
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                        Processing…
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-3.5 w-3.5 text-violet-400" />
                        Process with AI
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Import From Text Button */}
            <Dialog
              open={isTextImportDialogOpen}
              onOpenChange={setIsTextImportDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-start gap-3 h-auto py-3 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 shrink-0">
                    <Upload className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-800">
                      Import Text
                    </div>
                    <div className="text-xs text-gray-400">
                      From any text content
                    </div>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[560px] p-0 bg-white border border-gray-200 shadow-md rounded-xl overflow-hidden">
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
                  <DialogTitle className="text-base font-semibold text-gray-900">
                    Import from Text
                  </DialogTitle>
                  <DialogDescription className="text-xs text-gray-500 mt-0.5">
                    Paste any text (resume, achievements, job history). AI will
                    extract and add relevant info to your profile.
                  </DialogDescription>
                </DialogHeader>
                <div className="px-6 py-5 space-y-4">
                  <label
                    onDragEnter={(e) => handleDrag(e, setIsTextImportDragging)}
                    onDragLeave={(e) => handleDrag(e, setIsTextImportDragging)}
                    onDragOver={(e) => handleDrag(e, setIsTextImportDragging)}
                    onDrop={(e) => handleDrop(e, setTextImportContent)}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2.5 transition-colors duration-150 cursor-pointer",
                      isTextImportDragging
                        ? "border-violet-400 bg-violet-50"
                        : "border-gray-200 hover:border-violet-200 hover:bg-violet-50/40"
                    )}
                  >
                    <input
                      type="file"
                      className="hidden"
                      accept="application/pdf"
                      onChange={(e) => handleFileInput(e, setTextImportContent)}
                    />
                    <div className="h-10 w-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center">
                      <Upload className="h-5 w-5 text-violet-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">
                        Drop a PDF file here
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        or click to browse files
                      </p>
                    </div>
                  </label>
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-gray-500">
                      Or paste your text content
                    </p>
                    <Textarea
                      value={textImportContent}
                      onChange={(e) => setTextImportContent(e.target.value)}
                      placeholder="Paste your resume, bio, or any relevant text here..."
                      className="min-h-[100px] bg-white border-gray-200 text-sm placeholder:text-gray-400 focus:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                    />
                  </div>
                </div>
                {apiKeyError && (
                  <div className="mx-6 mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-700">
                        API Key Required
                      </p>
                      <p className="text-xs text-red-500 mt-0.5">
                        {apiKeyError}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => (window.location.href = "/settings")}
                      >
                        Go to Settings
                      </Button>
                    </div>
                  </div>
                )}
                <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50/60">
                  <Button
                    variant="outline"
                    onClick={() => setIsTextImportDialogOpen(false)}
                    className="border-gray-200 text-gray-600 hover:bg-white transition-colors duration-150"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleResumeUpload(textImportContent)}
                    disabled={isProcessingResume || !textImportContent.trim()}
                    className="bg-gray-900 hover:bg-gray-700 text-white transition-colors duration-150"
                  >
                    {isProcessingResume ? (
                      <>
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                        Processing…
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-3.5 w-3.5 text-violet-400" />
                        Process with AI
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabs */}
        <div className="animate-fade-up" style={{ animationDelay: "120ms" }}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="h-auto bg-white border border-gray-200 rounded-lg p-1 flex gap-0.5 overflow-x-auto whitespace-nowrap shadow-sm mb-4">
              {[
                { value: "basic", icon: User, label: "Basic Info" },
                { value: "experience", icon: Briefcase, label: "Experience" },
                { value: "projects", icon: FolderGit2, label: "Projects" },
                { value: "education", icon: GraduationCap, label: "Education" },
                { value: "skills", icon: Wrench, label: "Skills" },
                {
                  value: "certifications",
                  icon: Award,
                  label: "Certifications",
                },
              ].map(({ value, icon: Icon, label }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-gray-500
                    data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 data-[state=active]:shadow-none
                    hover:text-gray-700 transition-colors duration-150"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="space-y-4">
              <TabsContent
                value="basic"
                className="mt-0 animate-in fade-in-50 slide-in-from-bottom-1 duration-300"
              >
                <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
                  <div className="p-6">
                    <ProfileBasicInfoForm
                      profile={profile}
                      onChange={(field, value) => {
                        if (field in profile) {
                          updateField(field as keyof Profile, value);
                        }
                      }}
                    />
                  </div>
                </Card>
              </TabsContent>

              <TabsContent
                value="experience"
                className="mt-0 animate-in fade-in-50 slide-in-from-bottom-1 duration-300"
              >
                <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
                  <div className="p-6">
                    <ProfileWorkExperienceForm
                      experiences={profile.work_experience}
                      onChange={(experiences) =>
                        updateField("work_experience", experiences)
                      }
                    />
                  </div>
                </Card>
              </TabsContent>

              <TabsContent
                value="projects"
                className="mt-0 animate-in fade-in-50 slide-in-from-bottom-1 duration-300"
              >
                <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
                  <div className="p-6">
                    <ProfileProjectsForm
                      projects={profile.projects}
                      onChange={(projects) => updateField("projects", projects)}
                    />
                  </div>
                </Card>
              </TabsContent>

              <TabsContent
                value="education"
                className="mt-0 animate-in fade-in-50 slide-in-from-bottom-1 duration-300"
              >
                <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
                  <div className="p-6">
                    <ProfileEducationForm
                      education={profile.education}
                      onChange={(education) =>
                        updateField("education", education)
                      }
                    />
                  </div>
                </Card>
              </TabsContent>

              <TabsContent
                value="skills"
                className="mt-0 animate-in fade-in-50 slide-in-from-bottom-1 duration-300"
              >
                <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
                  <div className="p-6">
                    <ProfileSkillsForm
                      skills={profile.skills}
                      onChange={(skills) => updateField("skills", skills)}
                    />
                  </div>
                </Card>
              </TabsContent>

              <TabsContent
                value="certifications"
                className="mt-0 animate-in fade-in-50 slide-in-from-bottom-1 duration-300"
              >
                <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
                  <div className="p-6">
                    <ProfileCertificationsForm
                      certifications={profile.certifications || []}
                      onChange={(certifications) =>
                        updateField("certifications", certifications)
                      }
                    />
                  </div>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
