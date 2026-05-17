"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { History, RotateCcw, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "@/hooks/use-toast";
import {
  getResumeVersions,
  restoreResumeVersion,
} from "@/utils/actions/resumes/actions";

interface VersionMeta {
  id: string;
  resume_id: string;
  user_id: string;
  created_at: string;
}

interface VersionHistorySheetProps {
  resumeId: string;
  buttonClassName?: string;
}

function formatRelativeTime(isoString: string): string {
  const now = Date.now();
  const ts = new Date(isoString).getTime();
  const diffMs = now - ts;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay === 1) return "yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;

  return new Date(isoString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: diffDay > 365 ? "numeric" : undefined,
  });
}

function formatAbsoluteTime(isoString: string): string {
  return new Date(isoString).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function VersionHistorySheet({
  resumeId,
  buttonClassName,
}: VersionHistorySheetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [versions, setVersions] = useState<VersionMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const fetchVersions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getResumeVersions(resumeId);
      setVersions(data as VersionMeta[]);
    } catch {
      toast({
        title: "Failed to load history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [resumeId]);

  useEffect(() => {
    if (open) fetchVersions();
  }, [open, fetchVersions]);

  const handleRestore = async (versionId: string) => {
    setRestoringId(versionId);
    try {
      await restoreResumeVersion(versionId, resumeId);
      toast({ title: "Version restored" });
      setOpen(false);
      router.refresh();
    } catch {
      toast({
        title: "Restore failed",
        description: "Unable to restore this version. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className={buttonClassName}>
          <History className="mr-1.5 h-3.5 w-3.5" />
          History
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 p-0 flex flex-col">
        <SheetHeader className="px-4 py-3 border-b border-gray-100">
          <SheetTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-gray-400" />
            Version History
          </SheetTitle>
          <p className="text-xs text-gray-500">
            Saved automatically before each save. Restoring snapshots the
            current state first.
          </p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>
          ) : versions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <History className="h-8 w-8 text-gray-200 mb-3" />
              <p className="text-sm text-gray-500">No versions yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Versions are created each time you save.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {versions.map((v) => (
                <li
                  key={v.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-900 tabular-nums">
                      {formatAbsoluteTime(v.created_at)}
                    </p>
                    <p className="text-xs text-gray-400 tabular-nums">
                      {formatRelativeTime(v.created_at)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-[11px] text-gray-600 hover:text-gray-900 hover:bg-gray-100 shrink-0 ml-2"
                    disabled={restoringId !== null}
                    onClick={() => handleRestore(v.id)}
                  >
                    {restoringId === v.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <>
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Restore
                      </>
                    )}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
