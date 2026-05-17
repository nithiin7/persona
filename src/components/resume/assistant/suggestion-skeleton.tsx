"use client";

import { Sparkles } from "lucide-react";

export function SuggestionSkeleton() {
  return (
    <div className="border border-gray-200 rounded-xl bg-white p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
          <Sparkles className="h-3.5 w-3.5 text-violet-400" />
        </div>
        <div className="h-3.5 w-28 bg-gray-100 rounded animate-pulse" />
      </div>

      {/* Content box */}
      <div className="border border-gray-100 rounded-lg bg-gray-50 p-3 space-y-3">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="h-4 w-44 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-28 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="h-3 w-14 bg-gray-100 rounded animate-pulse shrink-0" />
        </div>

        <div className="space-y-2 pt-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-gray-200 mt-2 shrink-0" />
              <div
                className="h-3.5 bg-gray-100 rounded animate-pulse"
                style={{ width: `${85 - i * 10}%` }}
              />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-5 w-14 rounded-full bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-2">
        <div className="h-8 w-20 rounded-lg bg-gray-100 animate-pulse" />
        <div className="h-8 w-20 rounded-lg bg-gray-100 animate-pulse" />
      </div>
    </div>
  );
}
