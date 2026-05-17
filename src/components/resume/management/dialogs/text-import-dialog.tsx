"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, AlertTriangle } from "lucide-react";
import { Resume } from "@/lib/types";

import { toast } from "@/hooks/use-toast";
import { addTextToResume } from "@/utils/actions/resumes/ai";
import { fetchLinkedInProfileText } from "@/utils/actions/profiles/ai";
import pdfToText from "react-pdftotext";
import { cn } from "@/lib/utils";

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

interface TextImportDialogProps {
  resume: Resume;
  onResumeChange: (field: keyof Resume, value: Resume[keyof Resume]) => void;
  trigger: React.ReactNode;
}

export function TextImportDialog({
  resume,
  onResumeChange,
  trigger,
}: TextImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [apiKeyError, setApiKeyError] = useState("");
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [isFetchingLinkedIn, setIsFetchingLinkedIn] = useState(false);

  useEffect(() => {
    if (!open) {
      setApiKeyError("");
      setLinkedInUrl("");
    }
  }, [open]);

  const isLinkedInUrl = (s: string) =>
    /^https?:\/\/(www\.)?linkedin\.com\//i.test(s.trim());

  const handleLinkedInFetch = async (url: string = linkedInUrl) => {
    setIsFetchingLinkedIn(true);
    try {
      const text = await fetchLinkedInProfileText(url.trim());
      setContent((prev) => (prev ? prev + "\n\n" : "") + text);
      toast({
        title: "LinkedIn profile fetched",
        description: "Review the content below then click Import.",
      });
    } catch (error) {
      toast({
        title: "LinkedIn fetch failed",
        description:
          error instanceof Error ? error.message : "Could not fetch profile.",
        variant: "destructive",
      });
    } finally {
      setIsFetchingLinkedIn(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find((file) => file.type === "application/pdf");

    if (pdfFile) {
      try {
        const text = await pdfToText(pdfFile);
        setContent((prev) => prev + (prev ? "\n\n" : "") + text);
      } catch (err) {
        console.error("PDF processing error:", err);
        toast({
          title: "PDF Processing Error",
          description:
            "Failed to extract text from the PDF. Please try again or paste the content manually.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Invalid File",
        description: "Please drop a PDF file.",
        variant: "destructive",
      });
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      try {
        const text = await pdfToText(file);
        setContent((prev) => prev + (prev ? "\n\n" : "") + text);
      } catch (err) {
        console.error("PDF processing error:", err);
        toast({
          title: "PDF Processing Error",
          description:
            "Failed to extract text from the PDF. Please try again or paste the content manually.",
          variant: "destructive",
        });
      }
    }
  };

  const handleImport = async () => {
    setApiKeyError("");
    const trimmed = content.trim();
    if (!trimmed) {
      toast({
        title: "No content",
        description: "Please enter some text to import.",
        variant: "destructive",
      });
      return;
    }
    if (isLinkedInUrl(trimmed)) {
      setLinkedInUrl(trimmed);
      setContent("");
      await handleLinkedInFetch(trimmed);
      return;
    }

    setIsProcessing(true);
    try {
      const updatedResume = await addTextToResume(content, resume);

      // Update each field of the resume
      (Object.keys(updatedResume) as Array<keyof Resume>).forEach((key) => {
        onResumeChange(key, updatedResume[key] as Resume[keyof Resume]);
      });

      toast({
        title: "Import successful",
        description: "Your resume has been updated with the imported content.",
      });
      setOpen(false);
      setContent("");
    } catch (error) {
      console.error("Import error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      if (errorMessage.includes("API key")) {
        setApiKeyError(
          "API key required. Please add your OpenAI API key in settings or upgrade to our Pro Plan."
        );
      } else {
        toast({
          title: "Import failed",
          description: "Failed to process the text. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-xl border-white/40 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Import Resume Content
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2 text-base text-muted-foreground/80">
              <p className="font-medium text-foreground">
                Choose one of these options:
              </p>
              <ol className="list-decimal list-inside space-y-1 ml-1">
                <li>
                  Upload your PDF resume by dropping it below or clicking to
                  browse
                </li>
                <li>Paste your resume text directly into the text area</li>
              </ol>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* LinkedIn URL import */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
              <LinkedInIcon className="h-3.5 w-3.5 text-[#0077b5]" />
              Import from LinkedIn
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
                disabled={isFetchingLinkedIn || !isLinkedInUrl(linkedInUrl)}
                onClick={() => handleLinkedInFetch()}
                className="h-9 px-3 bg-[#0077b5] hover:bg-[#005885] text-white text-xs shrink-0 transition-colors"
              >
                {isFetchingLinkedIn ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  "Fetch & Import"
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-400">
              Paste your LinkedIn URL — we&apos;ll fetch the profile and
              pre-fill the text area below.
            </p>
            {isLinkedInUrl(content) && (
              <p className="text-xs text-amber-600">
                That looks like a URL — use the field above to fetch it.
              </p>
            )}
          </div>

          <div className="border-t border-gray-100" />

          <label
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-3 transition-colors duration-200 cursor-pointer group",
              isDragging
                ? "border-violet-500 bg-violet-50/50"
                : "border-violet-500/80 hover:border-violet-500 hover:bg-violet-50/10"
            )}
          >
            <input
              type="file"
              className="hidden"
              accept="application/pdf"
              onChange={handleFileInput}
            />
            <Upload className="w-10 h-10 text-violet-500 group-hover:scale-110 transition-transform duration-200" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Drop your PDF resume here
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse files
              </p>
            </div>
          </label>
          <div className="relative">
            <div className="absolute -top-3 left-3 bg-white px-2 text-sm text-muted-foreground">
              Or paste your resume text here
            </div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start pasting your resume content here..."
              className="min-h-[100px] bg-white/50 border-black/40 focus:border-violet-500/40 focus:ring-violet-500/20 transition-all duration-300 pt-4"
            />
          </div>
        </div>
        {apiKeyError && (
          <div className="px-4 py-3 bg-red-50/50 border border-red-200/50 rounded-lg flex items-start gap-3 text-red-600 text-sm">
            <div className="p-1.5 rounded-full bg-red-100">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium">API Key Required</p>
              <p className="text-red-500/90">{apiKeyError}</p>
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50/50 w-auto mx-auto"
                  onClick={() => (window.location.href = "/settings")}
                >
                  Set API Keys in Settings
                </Button>
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-gray-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={isProcessing || !content.trim()}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Import"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
