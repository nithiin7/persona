import { Skeleton } from "@/components/ui/skeleton";

function KanbanCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 space-y-2">
      <Skeleton className="h-3.5 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex gap-1.5 pt-0.5">
        <Skeleton className="h-3 w-14 rounded-full" />
        <Skeleton className="h-3 w-10 rounded-full" />
      </div>
    </div>
  );
}

function KanbanColumnSkeleton({ cards = 2 }: { cards?: number }) {
  return (
    <div className="flex-1 min-w-[180px] space-y-2">
      {/* Column header */}
      <div className="flex items-center gap-1.5 pb-1">
        <Skeleton className="h-2 w-2 rounded-full" />
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-4 w-5 rounded-full ml-auto" />
      </div>
      {/* Cards */}
      <div className="space-y-2">
        {[...Array(cards)].map((_, i) => (
          <KanbanCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function KanbanSkeleton() {
  const cardCounts = [2, 1, 1, 0, 0, 1];
  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-baseline justify-between">
        <div className="space-y-1">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-3.5 w-24" />
        </div>
      </div>
      {/* Columns */}
      <div className="flex gap-3 overflow-hidden">
        {cardCounts.map((count, i) => (
          <KanbanColumnSkeleton key={i} cards={count} />
        ))}
      </div>
    </div>
  );
}

function ResumeCardSkeleton() {
  return (
    <div className="shrink-0 w-36 space-y-2">
      <Skeleton className="aspect-[8.5/11] w-full rounded-xl" />
      <Skeleton className="h-3 w-24 mx-auto" />
    </div>
  );
}

function ResumeSectionSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3.5 w-24" />
        </div>
        <Skeleton className="h-7 w-28 rounded-lg" />
      </div>
      <div className="flex gap-4 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <ResumeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default function HomeLoading() {
  return (
    <div className="min-h-screen relative pt-14">
      <div className="fixed inset-0 z-0 bg-gray-50">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-70" />
      </div>

      <div className="relative z-10">
        {/* ProfileRow skeleton */}
        <div className="border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-24 rounded-lg" />
              <Skeleton className="h-7 w-20 rounded-lg" />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 space-y-6">
          {/* Greeting */}
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-52" />
            <Skeleton className="h-4 w-48" />
          </div>

          {/* Application Pipeline (Kanban) */}
          <KanbanSkeleton />

          <div className="h-px bg-gray-200" />

          {/* Base resumes */}
          <ResumeSectionSkeleton />

          <div className="h-px bg-gray-200" />

          {/* Tailored resumes */}
          <ResumeSectionSkeleton />
        </div>
      </div>
    </div>
  );
}
