"use client";

import {
  Profile,
  WorkExperience,
  Education,
  Project,
  Certification,
  Publication,
  Volunteer,
  Language,
  Award,
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
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Upload,
  Save,
  Trash2,
  Award as AwardIcon,
  Sparkles,
  ExternalLink,
  FileJson,
  BookOpen,
  Heart,
  Globe,
  Trophy,
} from "lucide-react";

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

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
import { ProfilePublicationsForm } from "@/components/profile/profile-publications-form";
import { ProfileVolunteerForm } from "@/components/profile/profile-volunteer-form";
import { ProfileLanguagesForm } from "@/components/profile/profile-languages-form";
import { ProfileAwardsForm } from "@/components/profile/profile-awards-form";
import {
  formatProfileWithAI,
  fetchLinkedInProfileText,
} from "../../utils/actions/profiles/ai";
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
  const [isLinkedInDialogOpen, setIsLinkedInDialogOpen] = useState(false);
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [linkedInContent, setLinkedInContent] = useState("");
  const [linkedInMode, setLinkedInMode] = useState<"text" | "json">("text");
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
        publications: [],
        volunteer: [],
        languages: [],
        awards: [],
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

  const isLinkedInUrl = (s: string) =>
    /^https?:\/\/(www\.)?linkedin\.com\//i.test(s.trim());

  const handleLinkedInFetchAndImport = async (url: string) => {
    try {
      setIsProcessingResume(true);
      setApiKeyError("");
      const text = await fetchLinkedInProfileText(url);
      // Save the URL to profile regardless of parse outcome
      setProfile((prev) => ({ ...prev, linkedin_url: url.trim() }));
      await handleResumeUpload(text);
      setIsLinkedInDialogOpen(false);
      setLinkedInContent("");
      setLinkedInUrl("");
      setLinkedInMode("text");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setIsProcessingResume(false);
    }
  };

  const handleLinkedInImport = async (content: string) => {
    // If the pasted content is itself a LinkedIn URL, fetch it server-side
    if (isLinkedInUrl(content)) {
      await handleLinkedInFetchAndImport(content.trim());
      return;
    }
    if (linkedInUrl.trim()) {
      setProfile((prev) => ({ ...prev, linkedin_url: linkedInUrl.trim() }));
    }
    await handleResumeUpload(content);
    setIsLinkedInDialogOpen(false);
    setLinkedInContent("");
    setLinkedInUrl("");
    setLinkedInMode("text");
  };

  const handleLinkedInJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      if (typeof text === "string") setLinkedInContent(text);
    };
    reader.readAsText(file);
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
          publications: Array.isArray(result.publications)
            ? result.publications.map((pub: Partial<Publication>) => ({
                title: pub.title || "",
                authors: pub.authors || undefined,
                venue: pub.venue || undefined,
                date: pub.date || undefined,
                url: pub.url || undefined,
              }))
            : undefined,
          volunteer: Array.isArray(result.volunteer)
            ? result.volunteer.map((vol: Partial<Volunteer>) => ({
                organization: vol.organization || "",
                role: vol.role || "",
                location: vol.location || undefined,
                date: vol.date || undefined,
                description: Array.isArray(vol.description)
                  ? vol.description
                  : [],
              }))
            : undefined,
          languages: Array.isArray(result.languages)
            ? result.languages.map((lang: Partial<Language>) => ({
                language: lang.language || "",
                proficiency: lang.proficiency || undefined,
              }))
            : undefined,
          awards: Array.isArray(result.awards)
            ? result.awards.map((award: Partial<Award>) => ({
                title: award.title || "",
                issuer: award.issuer || undefined,
                date: award.date || undefined,
                description: award.description || undefined,
              }))
            : undefined,
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
            <Dialog
              open={isLinkedInDialogOpen}
              onOpenChange={(open) => {
                setIsLinkedInDialogOpen(open);
                if (!open) {
                  setLinkedInContent("");
                  setLinkedInUrl("");
                  setLinkedInMode("text");
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-start gap-3 h-auto py-3 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0077b5]/10 shrink-0">
                    <LinkedInIcon className="h-4 w-4 text-[#0077b5]" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-800">
                      LinkedIn
                    </div>
                    <div className="text-xs text-gray-400">
                      Import from profile
                    </div>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[580px] p-0 bg-white border border-gray-200 shadow-md rounded-xl overflow-hidden">
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
                  <DialogTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <LinkedInIcon className="h-4 w-4 text-[#0077b5]" />
                    Import from LinkedIn
                  </DialogTitle>
                  <DialogDescription className="text-xs text-gray-500 mt-0.5">
                    AI will extract and merge your LinkedIn data into your
                    profile. Existing data is preserved.
                  </DialogDescription>
                </DialogHeader>

                {/* Mode tabs */}
                <div className="flex border-b border-gray-100">
                  <button
                    onClick={() => setLinkedInMode("text")}
                    className={cn(
                      "flex-1 py-2.5 text-xs font-medium transition-colors duration-150",
                      linkedInMode === "text"
                        ? "text-gray-900 border-b-2 border-gray-900"
                        : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    Copy Profile Text
                  </button>
                  <button
                    onClick={() => setLinkedInMode("json")}
                    className={cn(
                      "flex-1 py-2.5 text-xs font-medium transition-colors duration-150",
                      linkedInMode === "json"
                        ? "text-gray-900 border-b-2 border-gray-900"
                        : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    Data Export JSON
                  </button>
                </div>

                <div className="px-6 py-5 space-y-4">
                  {linkedInMode === "text" ? (
                    <>
                      {/* Step-by-step instructions */}
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2.5">
                        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                          How to copy your LinkedIn profile
                        </p>
                        {[
                          {
                            step: "1",
                            text: "Open your LinkedIn profile in a browser",
                            action: linkedInUrl ? (
                              <a
                                href={linkedInUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[#0077b5] hover:underline text-xs"
                              >
                                Open <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : null,
                          },
                          {
                            step: "2",
                            text: "Press Ctrl+A (⌘A on Mac) to select all",
                          },
                          {
                            step: "3",
                            text: "Press Ctrl+C (⌘C on Mac) to copy",
                          },
                          { step: "4", text: "Paste below with Ctrl+V (⌘V)" },
                        ].map(({ step, text, action }) => (
                          <div
                            key={step}
                            className="flex items-center gap-3 text-xs text-gray-600"
                          >
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-gray-700 font-semibold shrink-0 text-[10px]">
                              {step}
                            </span>
                            <span className="flex-1">{text}</span>
                            {action}
                          </div>
                        ))}
                      </div>

                      {/* URL field with fetch button */}
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium text-gray-500">
                          LinkedIn profile URL
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={linkedInUrl}
                            onChange={(e) => setLinkedInUrl(e.target.value)}
                            placeholder="https://www.linkedin.com/in/your-handle/"
                            className="flex-1 h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
                          />
                          <Button
                            size="sm"
                            disabled={
                              isProcessingResume || !isLinkedInUrl(linkedInUrl)
                            }
                            onClick={() =>
                              handleLinkedInFetchAndImport(linkedInUrl)
                            }
                            className="h-9 px-3 bg-[#0077b5] hover:bg-[#005885] text-white text-xs shrink-0 transition-colors"
                          >
                            {isProcessingResume ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              "Fetch & Import"
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-400">
                          Paste your LinkedIn profile URL and click &quot;Fetch
                          &amp; Import&quot; — or copy your profile text
                          manually below.
                        </p>
                      </div>

                      {/* Paste area */}
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium text-gray-500">
                          Or paste your profile text manually
                        </p>
                        <Textarea
                          value={linkedInContent}
                          onChange={(e) => setLinkedInContent(e.target.value)}
                          placeholder="Open your LinkedIn profile → Ctrl+A → Ctrl+C → paste here"
                          className="min-h-[100px] bg-white border-gray-200 text-sm placeholder:text-gray-400 focus:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                        />
                        {isLinkedInUrl(linkedInContent) && (
                          <p className="text-xs text-amber-600">
                            That looks like a URL — use the &quot;Fetch &amp;
                            Import&quot; button above instead.
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* JSON export instructions */}
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2.5">
                        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                          How to export your LinkedIn data
                        </p>
                        {[
                          {
                            step: "1",
                            text: 'Go to LinkedIn → Settings → Data Privacy → "Get a copy of your data"',
                          },
                          {
                            step: "2",
                            text: 'Select "Want something in particular?" and check Profile',
                          },
                          {
                            step: "3",
                            text: "Request the archive and download it when ready",
                          },
                          {
                            step: "4",
                            text: "Open the ZIP and paste the contents of Profile.json below, or upload the file",
                          },
                        ].map(({ step, text }) => (
                          <div
                            key={step}
                            className="flex items-start gap-3 text-xs text-gray-600"
                          >
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-gray-700 font-semibold shrink-0 text-[10px] mt-0.5">
                              {step}
                            </span>
                            <span>{text}</span>
                          </div>
                        ))}
                      </div>

                      {/* JSON file upload */}
                      <label className="flex items-center gap-3 px-4 py-3 border border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-colors duration-150">
                        <FileJson className="h-5 w-5 text-gray-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700">
                            Upload JSON file
                          </p>
                          <p className="text-xs text-gray-400">
                            Profile.json from your LinkedIn archive
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="application/json,.json"
                          className="hidden"
                          onChange={handleLinkedInJsonFile}
                        />
                        <Upload className="h-4 w-4 text-gray-300 shrink-0" />
                      </label>

                      {/* Paste area */}
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium text-gray-500">
                          Or paste the JSON content directly
                        </p>
                        <Textarea
                          value={linkedInContent}
                          onChange={(e) => setLinkedInContent(e.target.value)}
                          placeholder='{ "firstName": "Jane", "positions": [ … ] }'
                          className="min-h-[120px] bg-white border-gray-200 text-sm font-mono placeholder:text-gray-400 focus:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                        />
                      </div>
                    </>
                  )}
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
                    onClick={() => setIsLinkedInDialogOpen(false)}
                    className="border-gray-200 text-gray-600 hover:bg-white transition-colors duration-150"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleLinkedInImport(linkedInContent)}
                    disabled={isProcessingResume || !linkedInContent.trim()}
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
                        Import with AI
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

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
                  icon: AwardIcon,
                  label: "Certifications",
                },
                {
                  value: "publications",
                  icon: BookOpen,
                  label: "Publications",
                },
                { value: "volunteer", icon: Heart, label: "Volunteer" },
                { value: "languages", icon: Globe, label: "Languages" },
                { value: "awards", icon: Trophy, label: "Awards" },
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

              <TabsContent
                value="publications"
                className="mt-0 animate-in fade-in-50 slide-in-from-bottom-1 duration-300"
              >
                <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
                  <div className="p-6">
                    <ProfilePublicationsForm
                      publications={profile.publications || []}
                      onChange={(publications) =>
                        updateField("publications", publications)
                      }
                    />
                  </div>
                </Card>
              </TabsContent>

              <TabsContent
                value="volunteer"
                className="mt-0 animate-in fade-in-50 slide-in-from-bottom-1 duration-300"
              >
                <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
                  <div className="p-6">
                    <ProfileVolunteerForm
                      volunteer={profile.volunteer || []}
                      onChange={(volunteer) =>
                        updateField("volunteer", volunteer)
                      }
                    />
                  </div>
                </Card>
              </TabsContent>

              <TabsContent
                value="languages"
                className="mt-0 animate-in fade-in-50 slide-in-from-bottom-1 duration-300"
              >
                <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
                  <div className="p-6">
                    <ProfileLanguagesForm
                      languages={profile.languages || []}
                      onChange={(languages) =>
                        updateField("languages", languages)
                      }
                    />
                  </div>
                </Card>
              </TabsContent>

              <TabsContent
                value="awards"
                className="mt-0 animate-in fade-in-50 slide-in-from-bottom-1 duration-300"
              >
                <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
                  <div className="p-6">
                    <ProfileAwardsForm
                      awards={profile.awards || []}
                      onChange={(awards) => updateField("awards", awards)}
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
