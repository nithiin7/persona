import { Skeleton } from "@/components/ui/skeleton";

function SidebarSkeleton() {
  return (
    <div className="w-52 hidden lg:block shrink-0">
      <div className="sticky top-20 bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
        <Skeleton className="h-3 w-20 mb-3 ml-2" />
        <div className="space-y-0.5">
          {["Security", "API Keys", "Danger Zone"].map((label) => (
            <div
              key={label}
              className="flex items-center gap-2.5 px-2 py-2 rounded-md"
            >
              <Skeleton className="h-3.5 w-3.5 shrink-0 rounded-sm" />
              <Skeleton className="h-3.5 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CardSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      {/* Card header */}
      <div className="border-b border-gray-100 px-6 py-4 space-y-1.5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3.5 w-56" />
      </div>
      {/* Card rows */}
      <div className="px-6 py-5 space-y-0 divide-y divide-gray-100">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex items-center justify-between py-4">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-52" />
            </div>
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SettingsLoading() {
  return (
    <div className="relative pt-14">
      <div className="fixed inset-0 z-0 bg-gray-50">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-70" />
      </div>

      <main className="relative z-10 pt-6 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex gap-8 relative">
          <SidebarSkeleton />

          <div className="flex-1 space-y-6 min-w-0">
            <CardSkeleton rows={2} />
            <CardSkeleton rows={3} />
            <CardSkeleton rows={1} />
          </div>
        </div>
      </main>
    </div>
  );
}
