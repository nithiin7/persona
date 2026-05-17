"use client";

import { cn } from "@/lib/utils";
import { ReactNode, useState, useRef, useEffect } from "react";
import { ResizablePanels } from "./ResizablePanels";

interface EditorLayoutProps {
  isBaseResume: boolean;
  editorPanel: ReactNode;
  previewPanel: (width: number) => ReactNode;
}

function MobilePreviewContainer({
  previewPanel,
  active,
}: {
  previewPanel: (width: number) => ReactNode;
  active: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  // Measure when becoming visible so there's no blank-frame flash
  useEffect(() => {
    const el = ref.current;
    if (!el || !active) return;
    setWidth(el.clientWidth || window.innerWidth);
  }, [active]);

  // Keep width accurate on window resize
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0) setWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className={cn("h-full", !active && "hidden")}>
      {width > 0 && previewPanel(width)}
    </div>
  );
}

export function EditorLayout({
  isBaseResume,
  editorPanel,
  previewPanel,
}: EditorLayoutProps) {
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");

  return (
    <main className="flex h-full flex-col">
      {/* Mobile tab bar */}
      <div className="md:hidden shrink-0 flex border-b border-gray-200 bg-white">
        {(["edit", "preview"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={cn(
              "flex-1 py-2.5 text-sm font-medium capitalize transition-colors duration-150",
              mobileTab === tab
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-400 hover:text-gray-600"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Mobile content — both panels stay mounted to preserve form state */}
      <div className="md:hidden flex-1 overflow-hidden">
        <div className={cn("h-full", mobileTab !== "edit" && "hidden")}>
          {editorPanel}
        </div>
        <MobilePreviewContainer
          previewPanel={previewPanel}
          active={mobileTab === "preview"}
        />
      </div>

      {/* Desktop: resizable side-by-side panels */}
      <div className="hidden md:block relative py-4 px-6 md:px-8 lg:px-12 mx-auto w-full h-full shadow-xl">
        <ResizablePanels
          isBaseResume={isBaseResume}
          editorPanel={editorPanel}
          previewPanel={previewPanel}
        />
      </div>
    </main>
  );
}
