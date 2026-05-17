"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/logo";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) router.push("/");
    };
    checkSession();
  }, [router, supabase.auth]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);
    setIsLoading(true);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message);
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/"), 2000);
    } catch (error) {
      setError("An unexpected error occurred");
      console.error("Password update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "h-9 border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0";
  const labelClass = "text-xs font-medium text-gray-500";

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
              Set a new password
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Choose a strong password for your account.
            </p>
          </div>

          {/* Form */}
          <div className="px-7 py-6">
            {success ? (
              <div className="flex flex-col items-center gap-3 py-2 text-center">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Password updated
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Redirecting you to sign in…
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert
                    variant="destructive"
                    className="bg-red-50 text-red-800 border-red-200 py-2"
                  >
                    <AlertDescription className="text-xs">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="password" className={labelClass}>
                    New Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    autoFocus
                    className={inputClass}
                  />
                  <p className="text-[11px] text-gray-400">
                    Minimum 6 characters
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className={labelClass}>
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className={inputClass}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-9 bg-gray-900 hover:bg-gray-700 text-white text-sm transition-colors duration-150"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      Updating…
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
