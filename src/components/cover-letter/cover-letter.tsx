import CoverLetterEditor from "./cover-letter-editor";
import { useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useResumeContext } from "@/components/resume/editor/resume-editor-context";

interface CoverLetterProps {
  containerWidth: number;
}

export default function CoverLetter({ containerWidth }: CoverLetterProps) {
  const { state, dispatch } = useResumeContext();
  const contentRef = useRef<HTMLDivElement>(null);

  const handleContentChange = useCallback(
    (data: Record<string, unknown>) => {
      dispatch({
        type: "UPDATE_FIELD",
        field: "cover_letter",
        value: {
          content: data.content,
          lastUpdated: new Date().toISOString(),
        },
      });
    },
    [dispatch]
  );

  if (!state.resume.has_cover_letter) {
    return (
      <div className="px-4 py-6 flex flex-col items-center gap-3 border-t border-gray-200">
        <p className="text-xs text-gray-400 text-center">
          No cover letter yet. Generate one tailored to this job with AI.
        </p>
        <Button
          size="sm"
          className="bg-violet-600 hover:bg-violet-700 text-white transition-colors duration-150"
          onClick={() =>
            dispatch({
              type: "UPDATE_FIELD",
              field: "has_cover_letter",
              value: true,
            })
          }
        >
          <Sparkles className="h-3.5 w-3.5 mr-1.5" />
          Create Cover Letter with AI
        </Button>
      </div>
    );
  }

  return (
    <div className="">
      {/* Print version */}
      <div
        ref={contentRef}
        id="cover-letter-content"
        className="absolute -left-[9999px] w-[816px]"
      >
        <div
          className="p-16 prose prose-sm !max-w-none"
          dangerouslySetInnerHTML={{
            __html: state.resume.cover_letter?.content || "",
          }}
        />
      </div>

      {/* Interactive editor */}
      <div className="[&_.print-hidden]:hidden">
        <CoverLetterEditor
          initialData={{ content: state.resume.cover_letter?.content || "" }}
          onChange={handleContentChange}
          containerWidth={containerWidth}
        />
      </div>

      {/* <Button
        variant="outline"
        size="sm"
        className="w-full border-blue-600/50 text-blue-700 hover:bg-blue-50"
        onClick={handleExportPDF}
      >
        <Download className="h-4 w-4 mr-2" />
        Export as PDF
      </Button> */}
    </div>
  );
}
