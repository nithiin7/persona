export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      <div
        className="fixed inset-0 opacity-[0.4] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,transparent_40%,white_100%)] pointer-events-none" />
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-gray-200 animate-pulse" />
          <div className="h-4 w-16 rounded bg-gray-200 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
