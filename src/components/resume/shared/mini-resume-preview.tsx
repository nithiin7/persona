import { cn } from "@/lib/utils";

interface MiniResumePreviewProps {
  name: string;
  type: "base" | "tailored";
  updatedAt?: string;
  createdAt?: string;
  target_role?: string;
  className?: string;
}

export function MiniResumePreview({
  name,
  type,
  createdAt,
  target_role,
  className,
}: MiniResumePreviewProps) {
  function formatDate(dateString?: string) {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div
      className={cn(
        "relative w-full aspect-[8.5/11]",
        "rounded-lg overflow-hidden",
        "border border-gray-200 bg-white shadow-sm",
        "transition-all duration-200",
        "hover:shadow-md hover:-translate-y-0.5 hover:border-gray-300",
        "group",
        className
      )}
    >
      {/* Content */}
      <div className="relative h-full p-4 flex flex-col">
        {/* Header */}
        <div className="text-center mb-3 pb-2 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm mb-1.5 line-clamp-2 leading-snug">
            {name}
          </h3>
          {target_role && (
            <p className="text-[10px] text-gray-400 truncate mb-1.5">
              {target_role}
            </p>
          )}
          <span
            className={cn(
              "inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium",
              type === "base"
                ? "bg-violet-50 text-violet-600"
                : "bg-rose-50 text-rose-500"
            )}
          >
            {type === "base" ? "Base" : "Tailored"}
          </span>
        </div>

        {/* Mock document lines */}
        <div className="flex-1 space-y-3">
          {/* Contact line */}
          <div className="flex justify-center gap-2">
            {[40, 48, 36].map((w, i) => (
              <div
                key={i}
                className="h-1 rounded-full bg-gray-100"
                style={{ width: w }}
              />
            ))}
          </div>

          {/* Section 1 */}
          <div className="space-y-1">
            <div className="h-1.5 w-14 rounded-full bg-gray-200" />
            <div className="space-y-1">
              {["95%", "85%", "90%"].map((w, i) => (
                <div
                  key={i}
                  className="h-1 rounded-full bg-gray-100"
                  style={{ width: w }}
                />
              ))}
            </div>
          </div>

          {/* Section 2 */}
          <div className="space-y-1">
            <div className="h-1.5 w-20 rounded-full bg-gray-200" />
            {[0, 1].map((g) => (
              <div key={g} className="py-0.5 space-y-1">
                <div className="flex gap-2">
                  <div className="h-1 w-20 rounded-full bg-gray-200" />
                  <div className="h-1 w-14 rounded-full bg-gray-100" />
                </div>
                {[g === 0 ? "85%" : "95%", g === 0 ? "90%" : "80%"].map(
                  (w, i) => (
                    <div
                      key={i}
                      className="h-1 rounded-full bg-gray-100"
                      style={{ width: w }}
                    />
                  )
                )}
              </div>
            ))}
          </div>

          {/* Section 3 */}
          <div className="space-y-1">
            <div className="h-1.5 w-12 rounded-full bg-gray-200" />
            <div className="flex flex-wrap gap-1.5">
              {[56, 48, 64, 52].map((w, i) => (
                <div
                  key={i}
                  className="h-1 rounded-full bg-gray-100"
                  style={{ width: w }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Date */}
        {createdAt && (
          <div className="absolute bottom-2 right-2 text-[9px] text-gray-300 group-hover:text-gray-400 transition-colors duration-200">
            {formatDate(createdAt)}
          </div>
        )}
      </div>
    </div>
  );
}
