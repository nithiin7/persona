import { Skeleton } from "@/components/ui/skeleton";

function SettingsSectionSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
      <div className="space-y-1.5">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3.5 w-64" />
      </div>
      <div className="space-y-0 divide-y divide-gray-100">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex items-center justify-between py-4">
            <div className="space-y-1">
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

      <main className="relative z-10 pt-6 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-4">
        {/* Heading */}
        <div className="space-y-1.5 mb-6">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-4 w-64" />
        </div>

        <SettingsSectionSkeleton rows={3} />
        <SettingsSectionSkeleton rows={2} />
        <SettingsSectionSkeleton rows={2} />
      </main>
    </div>
  );
}
