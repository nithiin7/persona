"use client";

import { Resume, Job } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResumePreview } from "../preview/resume-preview";
import CoverLetter from "@/components/cover-letter/cover-letter";
import { ResumeContextMenu } from "../preview/resume-context-menu";

interface PreviewPanelProps {
  resume: Resume;
  onResumeChange: (field: keyof Resume, value: Resume[keyof Resume]) => void;
  width: number;
  job?: Job | null;
}

export function PreviewPanel({ resume, width, job }: PreviewPanelProps) {
  return (
    <ScrollArea className="h-full bg-gray-50">
      <div className="">
        <ResumeContextMenu resume={resume} job={job}>
          <ResumePreview resume={resume} containerWidth={width} />
        </ResumeContextMenu>
      </div>

      <CoverLetter containerWidth={width} />
    </ScrollArea>
  );
}
