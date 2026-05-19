"use client";

import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef, useState } from "react";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Strikethrough as StrikeIcon,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface CoverLetterEditorProps {
  initialData: Record<string, unknown>;
  onChange?: (data: Record<string, unknown>) => void;
  containerWidth: number;
  isPrintVersion?: boolean;
}

function CoverLetterEditor({
  initialData,
  onChange,
  containerWidth,
  isPrintVersion = false,
}: CoverLetterEditorProps) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [innerHeight, setInnerHeight] = useState(1056);

  useEffect(() => {
    if (isPrintVersion || !innerRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setInnerHeight(entry.contentRect.height);
    });
    observer.observe(innerRef.current);
    return () => observer.disconnect();
  }, [isPrintVersion]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right"],
      }),
    ],
    content:
      (initialData?.content as string) ||
      "<p>Start writing your cover letter...</p>",
    editorProps: {
      attributes: {
        class:
          "prose prose-xxs focus:outline-none h-full overflow-none max-w-none text-black ",
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.({
        content: editor.getHTML(),
        lastUpdated: new Date().toISOString(),
      });
    },
  });

  // Update effect to handle content changes
  useEffect(() => {
    if (editor && initialData?.content) {
      const currentContent = editor.getHTML();
      const newContent = initialData.content as string;
      if (newContent !== currentContent) {
        editor.commands.setContent(newContent);
      }
    }
  }, [initialData?.content, editor]);

  // Cleanup editor on unmount
  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  const scale = isPrintVersion ? 1 : containerWidth / 816;
  const outerHeight = isPrintVersion
    ? undefined
    : Math.max(innerHeight * scale, 96);

  return (
    <div className="relative w-full max-w-[816px] mx-auto shadow-lg overflow-hidden mb-12 bg-white">
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className="flex overflow-hidden rounded-lg border border-gray-300 bg-white shadow-xl"
        >
          {/* Text Style */}
          <div className="flex items-center">
            <Button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={cn(
                "h-8 px-3 hover:bg-gray-100 transition-colors",
                editor.isActive("bold") && "bg-gray-100 text-gray-900"
              )}
              variant="ghost"
              size="sm"
            >
              <BoldIcon className="h-4 w-4" />
            </Button>

            <Button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={cn(
                "h-8 px-3 hover:bg-gray-100 transition-colors",
                editor.isActive("italic") && "bg-gray-100 text-gray-900"
              )}
              variant="ghost"
              size="sm"
            >
              <ItalicIcon className="h-4 w-4" />
            </Button>

            <Button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={cn(
                "h-8 px-3 hover:bg-gray-100 transition-colors",
                editor.isActive("underline") && "bg-gray-100 text-gray-900"
              )}
              variant="ghost"
              size="sm"
            >
              <UnderlineIcon className="h-4 w-4" />
            </Button>

            <Button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={cn(
                "h-8 px-3 hover:bg-gray-100 transition-colors",
                editor.isActive("strike") && "bg-gray-100 text-gray-900"
              )}
              variant="ghost"
              size="sm"
            >
              <StrikeIcon className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="mx-1 h-8" />

          {/* Text Alignment */}
          <div className="flex items-center">
            <Button
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              className={cn(
                "h-8 px-3 hover:bg-gray-100 transition-colors",
                editor.isActive({ textAlign: "left" }) &&
                  "bg-gray-100 text-gray-900"
              )}
              variant="ghost"
              size="sm"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>

            <Button
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
              className={cn(
                "h-8 px-3 hover:bg-gray-100 transition-colors",
                editor.isActive({ textAlign: "center" }) &&
                  "bg-gray-100 text-gray-900"
              )}
              variant="ghost"
              size="sm"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>

            <Button
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              className={cn(
                "h-8 px-3 hover:bg-gray-100 transition-colors",
                editor.isActive({ textAlign: "right" }) &&
                  "bg-gray-100 text-gray-900"
              )}
              variant="ghost"
              size="sm"
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="mx-1 h-8" />

          {/* Headings */}
          <div className="flex items-center">
            <Button
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              className={cn(
                "h-8 px-3 hover:bg-gray-100 transition-colors",
                editor.isActive("heading", { level: 1 }) &&
                  "bg-gray-100 text-gray-900"
              )}
              variant="ghost"
              size="sm"
            >
              <Heading1 className="h-4 w-4" />
            </Button>

            <Button
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              className={cn(
                "h-8 px-3 hover:bg-gray-100 transition-colors",
                editor.isActive("heading", { level: 2 }) &&
                  "bg-gray-100 text-gray-900"
              )}
              variant="ghost"
              size="sm"
            >
              <Heading2 className="h-4 w-4" />
            </Button>
          </div>
        </BubbleMenu>
      )}
      {/* Outer sizing shell — height tracks scaled content */}
      <div
        className={cn("relative", isPrintVersion && "!h-auto")}
        style={!isPrintVersion ? { height: outerHeight } : undefined}
      >
        {/* Scaled content layer */}
        <div
          ref={innerRef}
          className={cn(
            "origin-top-left",
            isPrintVersion ? "relative w-full" : "absolute top-0 left-0"
          )}
          style={
            !isPrintVersion
              ? { transform: `scale(${scale})`, width: 816 }
              : undefined
          }
        >
          <div
            className={cn(
              "my-12 mx-16 min-h-[960px]",
              isPrintVersion && "!my-0 !mx-8"
            )}
          >
            <EditorContent
              editor={editor}
              className={cn(
                "focus:outline-none prose prose-xxs max-w-none",
                isPrintVersion && "!prose-sm !text-[12pt]"
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoverLetterEditor;
