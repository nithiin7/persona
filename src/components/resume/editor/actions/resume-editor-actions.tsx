"use client";

import { Resume } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { pdf } from "@react-pdf/renderer";
import { TextImport } from "../../text-import";
import { ResumePDFDocument } from "../preview/resume-pdf-document";
import { cn } from "@/lib/utils";
import { useResumeContext } from "../resume-editor-context";

import { updateResume } from "@/utils/actions/resumes/actions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { generateResumeDocx } from "@/lib/docx-export";

interface ResumeEditorActionsProps {
  onResumeChange: (field: keyof Resume, value: Resume[keyof Resume]) => void;
}

export function ResumeEditorActions({
  onResumeChange,
}: ResumeEditorActionsProps) {
  const { state, dispatch } = useResumeContext();
  const { resume, isSaving } = state;
  const [downloadOptions, setDownloadOptions] = useState({
    resume: true,
    coverLetter: true,
    resumeFormat: "pdf" as "pdf" | "docx",
  });

  // Save Resume
  const handleSave = async () => {
    try {
      dispatch({ type: "SET_SAVING", value: true });
      await updateResume(state.resume.id, state.resume);
      toast({
        title: "Changes saved",
        description: "Your resume has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description:
          error instanceof Error
            ? error.message
            : "Unable to save your changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      dispatch({ type: "SET_SAVING", value: false });
    }
  };

  const buttonClass =
    "h-8 px-3 text-[11px] font-medium rounded-md border-none text-white bg-gray-900 hover:bg-gray-700 " +
    "transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="px-1 py-2 @container">
      <div className="grid grid-cols-3 gap-2">
        {/* Text Import Button */}
        <TextImport
          resume={resume}
          onResumeChange={onResumeChange}
          className={buttonClass}
        />

        {/* Download Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={async () => {
                  try {
                    // Download Resume if selected
                    if (downloadOptions.resume) {
                      let blob: Blob;
                      let filename: string;
                      if (downloadOptions.resumeFormat === "docx") {
                        blob = await generateResumeDocx(resume);
                        filename = `${resume.first_name}_${resume.last_name}_Resume.docx`;
                      } else {
                        blob = await pdf(
                          <ResumePDFDocument resume={resume} />
                        ).toBlob();
                        filename = `${resume.first_name}_${resume.last_name}_Resume.pdf`;
                      }
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = filename;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                    }

                    // Download Cover Letter if selected and exists
                    if (
                      downloadOptions.coverLetter &&
                      resume.has_cover_letter
                    ) {
                      // Dynamically import html2pdf only when needed
                      const html2pdf = (await import("html2pdf.js")).default;

                      const coverLetterElement = document.getElementById(
                        "cover-letter-content"
                      );
                      if (!coverLetterElement) {
                        throw new Error("Cover letter content not found");
                      }

                      const opt = {
                        margin: [0, 0, -0.5, 0],
                        filename: `${resume.first_name}_${resume.last_name}_Cover_Letter.pdf`,
                        image: { type: "jpeg", quality: 0.98 },
                        html2canvas: {
                          backgroundColor: "red",
                          useCORS: true,
                          letterRendering: true,
                          // width: 700,
                          // height: 1000,
                          // windowWidth: 700,
                          logging: true,
                          // windowHeight: 2000
                        },
                        jsPDF: {
                          unit: "in",
                          format: "letter",
                          orientation: "portrait",
                        },
                      };

                      await html2pdf().set(opt).from(coverLetterElement).save();
                    }

                    toast({
                      title: "Download started",
                      description: "Your documents are being downloaded.",
                    });
                  } catch (error) {
                    console.error(error);
                    toast({
                      title: "Download failed",
                      description:
                        error instanceof Error
                          ? error.message
                          : "Unable to download your documents. Please try again.",
                      variant: "destructive",
                    });
                  }
                }}
                className={buttonClass}
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Download
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              align="start"
              sideOffset={5}
              className="w-44 p-3 bg-white border border-gray-200 rounded-lg shadow-md"
            >
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2">
                    <Checkbox
                      checked={downloadOptions.resume}
                      onCheckedChange={(checked) =>
                        setDownloadOptions((prev) => ({
                          ...prev,
                          resume: checked as boolean,
                        }))
                      }
                    />
                    <span className="text-xs font-medium text-gray-700">
                      Resume
                    </span>
                  </label>
                  {downloadOptions.resume && (
                    <div className="ml-6 flex gap-1">
                      {(["pdf", "docx"] as const).map((fmt) => (
                        <button
                          key={fmt}
                          type="button"
                          onClick={() =>
                            setDownloadOptions((prev) => ({
                              ...prev,
                              resumeFormat: fmt,
                            }))
                          }
                          className={cn(
                            "px-2 py-0.5 text-[10px] font-medium rounded border transition-colors duration-150",
                            downloadOptions.resumeFormat === fmt
                              ? "bg-gray-900 text-white border-gray-900"
                              : "text-gray-500 border-gray-200 hover:border-gray-400"
                          )}
                        >
                          {fmt.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={downloadOptions.coverLetter}
                    onCheckedChange={(checked) =>
                      setDownloadOptions((prev) => ({
                        ...prev,
                        coverLetter: checked as boolean,
                      }))
                    }
                  />
                  <span className="text-xs font-medium text-gray-700">
                    Cover Letter
                  </span>
                </label>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className={buttonClass}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-1.5 h-3.5 w-3.5" />
              Save
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
