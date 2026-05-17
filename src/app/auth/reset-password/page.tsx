import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Logo } from "@/components/ui/logo";

export default function ResetPasswordPage() {
  return (
    <div className="h-screen bg-white flex items-center justify-center overflow-y-auto px-4">
      {/* Dot grid */}
      <div
        className="fixed inset-0 opacity-[0.4] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,transparent_40%,white_100%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[380px]">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-7 pt-7 pb-5 border-b border-gray-100">
            <Logo asLink={false} className="mb-4" />
            <h1 className="text-base font-semibold text-gray-900">
              Reset your password
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          {/* Form */}
          <div className="px-7 py-6">
            <ResetPasswordForm />
          </div>
        </div>
      </div>
    </div>
  );
}
