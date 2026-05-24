"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useEffect, useRef, useState } from "react";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
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
  Link as LinkIcon,
  Unlink,
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

interface CoverLetterEditorProps {
  initialData: Record<string, unknown>;
  onChange?: (data: Record<string, unknown>) => void;
  containerWidth: number;
  isPrintVersion?: boolean;
}

type ToolbarMode = "format" | "link-edit";

function CoverLetterEditor({
  initialData,
  onChange,
  containerWidth,
  isPrintVersion = false,
}: CoverLetterEditorProps) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [innerHeight, setInnerHeight] = useState(1056);
  const [toolbarMode, setToolbarMode] = useState<ToolbarMode>("format");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const urlInputRef = useRef<HTMLInputElement>(null);

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
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: "text-blue-600 underline cursor-pointer hover:text-blue-800",
          rel: "noopener noreferrer",
          target: "_blank",
        },
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

  const openLinkDialog = useCallback(() => {
    if (!editor) return;
    const existingHref = editor.getAttributes("link").href as
      | string
      | undefined;
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, "");
    setLinkUrl(existingHref ?? "");
    setLinkText(selectedText);
    setToolbarMode("link-edit");
    setTimeout(() => urlInputRef.current?.focus(), 50);
  }, [editor]);

  const applyLink = useCallback(() => {
    if (!editor) return;
    const url = linkUrl.trim();
    if (!url) {
      editor.chain().focus().unsetLink().run();
      setToolbarMode("format");
      return;
    }
    const href = url.startsWith("http") ? url : `https://${url}`;
    const { from, to } = editor.state.selection;
    const hasTextSelected = from !== to;

    if (hasTextSelected) {
      editor.chain().focus().setLink({ href }).run();
    } else {
      const displayText = linkText.trim() || href;
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${href}">${displayText}</a>`)
        .run();
    }
    setToolbarMode("format");
  }, [editor, linkUrl, linkText]);

  const cancelLink = useCallback(() => {
    setToolbarMode("format");
    editor?.chain().focus().run();
  }, [editor]);

  const removeLink = useCallback(() => {
    editor?.chain().focus().unsetLink().run();
    setToolbarMode("format");
  }, [editor]);

  const isOnLink = editor?.isActive("link") ?? false;
  const hasSelection = editor
    ? editor.state.selection.from !== editor.state.selection.to
    : false;

  const scale = isPrintVersion ? 1 : containerWidth / 816;
  const outerHeight = isPrintVersion
    ? undefined
    : Math.max(innerHeight * scale, 96);

  return (
    <div className="relative w-full max-w-[816px] mx-auto mb-12">
      {/* Persistent toolbar — always visible, not scaled */}
      {!isPrintVersion && editor && (
        <div className="flex items-center flex-wrap gap-0.5 px-2 py-1.5 bg-white border border-gray-200 rounded-t-lg shadow-sm">
          {toolbarMode === "link-edit" ? (
            /* Link input row */
            <div className="flex items-center gap-1 w-full">
              {!hasSelection && (
                <>
                  <Input
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    placeholder="Link text"
                    className="h-7 w-28 text-xs border-gray-300"
                  />
                  <Separator orientation="vertical" className="mx-0.5 h-6" />
                </>
              )}
              <Input
                ref={urlInputRef}
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyLink();
                  if (e.key === "Escape") cancelLink();
                }}
                placeholder="https://..."
                className="h-7 w-52 text-xs border-gray-300"
              />
              <Button
                onClick={applyLink}
                className="h-7 w-7 p-0 hover:bg-green-50 hover:text-green-700"
                variant="ghost"
                size="sm"
                title="Apply link"
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button
                onClick={cancelLink}
                className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-700"
                variant="ghost"
                size="sm"
                title="Cancel"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <>
              {/* Text style */}
              <Button
                onMouseDown={(e) => {
                  e.preventDefault();
                  editor.chain().focus().toggleBold().run();
                }}
                className={cn(
                  "h-7 w-7 p-0 hover:bg-gray-100 transition-colors",
                  editor.isActive("bold") && "bg-gray-100 text-gray-900"
                )}
                variant="ghost"
                size="sm"
                title="Bold"
              >
                <BoldIcon className="h-3.5 w-3.5" />
              </Button>
              <Button
                onMouseDown={(e) => {
                  e.preventDefault();
                  editor.chain().focus().toggleItalic().run();
                }}
                className={cn(
                  "h-7 w-7 p-0 hover:bg-gray-100 transition-colors",
                  editor.isActive("italic") && "bg-gray-100 text-gray-900"
                )}
                variant="ghost"
                size="sm"
                title="Italic"
              >
                <ItalicIcon className="h-3.5 w-3.5" />
              </Button>
              <Button
                onMouseDown={(e) => {
                  e.preventDefault();
                  editor.chain().focus().toggleUnderline().run();
                }}
                className={cn(
                  "h-7 w-7 p-0 hover:bg-gray-100 transition-colors",
                  editor.isActive("underline") && "bg-gray-100 text-gray-900"
                )}
                variant="ghost"
                size="sm"
                title="Underline"
              >
                <UnderlineIcon className="h-3.5 w-3.5" />
              </Button>
              <Button
                onMouseDown={(e) => {
                  e.preventDefault();
                  editor.chain().focus().toggleStrike().run();
                }}
                className={cn(
                  "h-7 w-7 p-0 hover:bg-gray-100 transition-colors",
                  editor.isActive("strike") && "bg-gray-100 text-gray-900"
                )}
                variant="ghost"
                size="sm"
                title="Strikethrough"
              >
                <StrikeIcon className="h-3.5 w-3.5" />
              </Button>

              <Separator orientation="vertical" className="mx-0.5 h-5" />

              {/* Link */}
              <Button
                onMouseDown={(e) => {
                  e.preventDefault();
                  openLinkDialog();
                }}
                className={cn(
                  "h-7 w-7 p-0 hover:bg-gray-100 transition-colors",
                  isOnLink && "bg-gray-100 text-blue-600"
                )}
                variant="ghost"
                size="sm"
                title={isOnLink ? "Edit link" : "Add link"}
              >
                {isOnLink ? (
                  <ExternalLink className="h-3.5 w-3.5" />
                ) : (
                  <LinkIcon className="h-3.5 w-3.5" />
                )}
              </Button>
              {isOnLink && (
                <Button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    removeLink();
                  }}
                  className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600 transition-colors"
                  variant="ghost"
                  size="sm"
                  title="Remove link"
                >
                  <Unlink className="h-3.5 w-3.5" />
                </Button>
              )}

              <Separator orientation="vertical" className="mx-0.5 h-5" />

              {/* Alignment */}
              <Button
                onMouseDown={(e) => {
                  e.preventDefault();
                  editor.chain().focus().setTextAlign("left").run();
                }}
                className={cn(
                  "h-7 w-7 p-0 hover:bg-gray-100 transition-colors",
                  editor.isActive({ textAlign: "left" }) &&
                    "bg-gray-100 text-gray-900"
                )}
                variant="ghost"
                size="sm"
                title="Align left"
              >
                <AlignLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                onMouseDown={(e) => {
                  e.preventDefault();
                  editor.chain().focus().setTextAlign("center").run();
                }}
                className={cn(
                  "h-7 w-7 p-0 hover:bg-gray-100 transition-colors",
                  editor.isActive({ textAlign: "center" }) &&
                    "bg-gray-100 text-gray-900"
                )}
                variant="ghost"
                size="sm"
                title="Align center"
              >
                <AlignCenter className="h-3.5 w-3.5" />
              </Button>
              <Button
                onMouseDown={(e) => {
                  e.preventDefault();
                  editor.chain().focus().setTextAlign("right").run();
                }}
                className={cn(
                  "h-7 w-7 p-0 hover:bg-gray-100 transition-colors",
                  editor.isActive({ textAlign: "right" }) &&
                    "bg-gray-100 text-gray-900"
                )}
                variant="ghost"
                size="sm"
                title="Align right"
              >
                <AlignRight className="h-3.5 w-3.5" />
              </Button>

              <Separator orientation="vertical" className="mx-0.5 h-5" />

              {/* Headings */}
              <Button
                onMouseDown={(e) => {
                  e.preventDefault();
                  editor.chain().focus().toggleHeading({ level: 1 }).run();
                }}
                className={cn(
                  "h-7 w-7 p-0 hover:bg-gray-100 transition-colors",
                  editor.isActive("heading", { level: 1 }) &&
                    "bg-gray-100 text-gray-900"
                )}
                variant="ghost"
                size="sm"
                title="Heading 1"
              >
                <Heading1 className="h-3.5 w-3.5" />
              </Button>
              <Button
                onMouseDown={(e) => {
                  e.preventDefault();
                  editor.chain().focus().toggleHeading({ level: 2 }).run();
                }}
                className={cn(
                  "h-7 w-7 p-0 hover:bg-gray-100 transition-colors",
                  editor.isActive("heading", { level: 2 }) &&
                    "bg-gray-100 text-gray-900"
                )}
                variant="ghost"
                size="sm"
                title="Heading 2"
              >
                <Heading2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      )}

      {/* Editor paper */}
      <div
        className={cn(
          "bg-white shadow-lg overflow-hidden",
          !isPrintVersion && "rounded-b-lg"
        )}
      >
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
    </div>
  );
}

export default CoverLetterEditor;
