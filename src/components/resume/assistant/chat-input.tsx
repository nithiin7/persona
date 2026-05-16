import { Button } from "@/components/ui/button";
import { Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useState, useCallback, useRef, useEffect } from "react";

interface ChatInputProps {
  isLoading: boolean;
  onSubmit: (message: string) => void;
  onStop: () => void;
}

export default function ChatInput({
  isLoading,
  onSubmit,
  onStop,
}: ChatInputProps) {
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const newHeight = Math.min(textarea.scrollHeight, 120);
    textarea.style.height = `${newHeight}px`;
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue, adjustTextareaHeight]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (inputValue.trim()) {
        onSubmit(inputValue.replace(/\n+$/, "").trim());
        setInputValue("");
      }
    },
    [inputValue, onSubmit]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 px-3 py-2.5 border-t border-violet-100 bg-white"
    >
      <textarea
        ref={textareaRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          } else if (e.key === "Enter" && e.shiftKey) {
            requestAnimationFrame(adjustTextareaHeight);
          }
        }}
        placeholder="Ask Persona anything about your resume…"
        rows={1}
        className={cn(
          "flex-1 resize-none overflow-y-auto",
          "bg-violet-50/50 rounded-xl",
          "border border-violet-100",
          "px-3 py-2 text-sm text-gray-800",
          "placeholder:text-violet-300",
          "focus:outline-none focus:border-violet-300 focus:bg-white",
          "transition-colors duration-150",
          "min-h-[36px] max-h-[120px]"
        )}
      />
      <Button
        type={isLoading ? "button" : "submit"}
        onClick={isLoading ? onStop : undefined}
        size="sm"
        className={cn(
          "shrink-0 h-9 w-9 p-0 rounded-xl",
          isLoading
            ? "bg-red-500 hover:bg-red-600"
            : "bg-violet-600 hover:bg-violet-700",
          "text-white border-none transition-colors duration-150"
        )}
      >
        {isLoading ? (
          <X className="h-3.5 w-3.5" />
        ) : (
          <Send className="h-3.5 w-3.5" />
        )}
      </Button>
    </form>
  );
}
