import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="relative pt-14">
      <div className="fixed inset-0 z-0 bg-gray-50">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-70" />
      </div>

      <div className="relative z-10 animate-fade-in">
        {/* Action bar */}
        <div className="border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-28 rounded-lg" />
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 pb-10 pt-6 space-y-5">
          {/* Profile completion card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-52" />
              </div>
              <Skeleton className="h-8 w-12" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
            <div className="mt-3 flex gap-1.5">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-5 w-20 rounded-full" />
              ))}
            </div>
          </div>

          {/* Import options */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <Skeleton className="h-3 w-24" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          </div>

          {/* Tabs + form */}
          <div className="space-y-4">
            <div className="flex gap-0.5 p-1 bg-white border border-gray-200 rounded-lg shadow-sm overflow-x-auto">
              {[...Array(6)].map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-8 flex-1 min-w-[80px] rounded-md"
                />
              ))}
            </div>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-9 w-full rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
