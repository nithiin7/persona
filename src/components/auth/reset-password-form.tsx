"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { resetPasswordForEmail } from "@/app/auth/login/actions";
import Link from "next/link";

interface FormState {
  error?: string;
  success?: boolean;
}

export function ResetPasswordForm() {
  const [formState, setFormState] = useState<FormState>({});
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState({});
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      const result = await resetPasswordForEmail(formData);

      if (!result.success) {
        setFormState({ error: result.error || "Failed to send reset email" });
        return;
      }

      setEmail("");
      setFormState({ success: true });
    } catch (error: unknown) {
      console.error("Password reset error:", error);
      setFormState({ error: "An unexpected error occurred" });
    } finally {
      setIsLoading(false);
    }
  }

  if (formState.success) {
    return (
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">Check your inbox</p>
          <p className="text-xs text-gray-500 mt-1">
            We sent a password reset link to your email address.
          </p>
        </div>
        <Link
          href="/"
          className="mt-2 inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors duration-150"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formState.error && (
        <Alert
          variant="destructive"
          className="bg-red-50 text-red-800 border-red-200 py-2"
        >
          <AlertDescription className="text-xs">
            {formState.error}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs font-medium text-gray-500">
          Email address
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoFocus
          className="h-9 border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
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
            Sending…
          </>
        ) : (
          "Send Reset Link"
        )}
      </Button>

      <div className="text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors duration-150"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to sign in
        </Link>
      </div>
    </form>
  );
}
