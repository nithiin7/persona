"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface KeywordHighlightBarProps {
  matchedKeywords: string[];
  missingKeywords: string[];
}

export function KeywordHighlightBar({
  matchedKeywords,
  missingKeywords,
}: KeywordHighlightBarProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (matchedKeywords.length === 0 && missingKeywords.length === 0) return null;

  return (
    <div className="border border-gray-200 rounded-lg bg-white mt-3 overflow-hidden">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors"
      >
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          ATS Keywords
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 tabular-nums">
            {matchedKeywords.length} matched · {missingKeywords.length} missing
          </span>
          {collapsed ? (
            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          ) : (
            <ChevronUp className="h-3.5 w-3.5 text-gray-400" />
          )}
        </div>
      </button>

      {!collapsed && (
        <div className="px-3 pb-3 space-y-2 border-t border-gray-100">
          {matchedKeywords.length > 0 && (
            <div className="pt-2">
              <p className="text-xs text-gray-400 mb-1.5">Matched</p>
              <div className="flex flex-wrap gap-1">
                {matchedKeywords.map((keyword, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
          {missingKeywords.length > 0 && (
            <div className={cn(matchedKeywords.length > 0 && "pt-1")}>
              <p className="text-xs text-gray-400 mb-1.5">Missing</p>
              <div className="flex flex-wrap gap-1">
                {missingKeywords.map((keyword, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
