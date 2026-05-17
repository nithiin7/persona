import { Skeleton } from "@/components/ui/skeleton";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

export default function ResumeEditorLoading() {
  return (
    <div className="h-[calc(100vh-56px)] bg-gray-50 overflow-hidden">
      <div className="h-full max-w-[2000px] mx-auto px-4 py-4">
        <ResizablePanelGroup direction="horizontal" className="h-full gap-2">
          {/* Editor Panel */}
          <ResizablePanel defaultSize={38}>
            <div className="flex flex-col h-full bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Header + tabs */}
              <div className="px-4 pt-4 pb-3 border-b border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-40" />
                  <div className="flex gap-2">
                    <Skeleton className="h-7 w-20 rounded-lg" />
                    <Skeleton className="h-7 w-20 rounded-lg" />
                  </div>
                </div>
                {/* Content tabs — 3×2 grid */}
                <div className="grid grid-cols-3 gap-1">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-8 rounded-md" />
                  ))}
                </div>
                {/* Tool tabs — 1×3 grid */}
                <div className="grid grid-cols-3 gap-1">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-8 rounded-md" />
                  ))}
                </div>
              </div>

              {/* Form fields */}
              <div className="flex-1 p-4 space-y-4 overflow-hidden">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-9 w-full rounded-lg" />
                  </div>
                ))}
              </div>

              {/* Chat input bar */}
              <div className="p-3 border-t border-violet-100 bg-white">
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle className="w-px bg-gray-200 mx-1" />

          {/* Preview Panel */}
          <ResizablePanel defaultSize={62}>
            <div className="h-full bg-white border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center p-6">
              {/* A4 paper skeleton */}
              <div className="w-full max-w-[580px] aspect-[8.5/11] bg-gray-50 border border-gray-200 rounded-lg p-8 space-y-5">
                {/* Name / contact */}
                <div className="text-center space-y-2">
                  <Skeleton className="h-7 w-44 mx-auto" />
                  <Skeleton className="h-3.5 w-60 mx-auto" />
                  <div className="flex justify-center gap-3 pt-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
                <div className="h-px bg-gray-200" />
                {/* Resume sections */}
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <div className="h-px bg-gray-200" />
                    {[...Array(2)].map((_, j) => (
                      <div key={j} className="space-y-1.5 pl-1">
                        <div className="flex justify-between">
                          <Skeleton className="h-3.5 w-40" />
                          <Skeleton className="h-3.5 w-20" />
                        </div>
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-4/5" />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
