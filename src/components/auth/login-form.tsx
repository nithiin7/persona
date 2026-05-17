"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/app/auth/login/actions";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "./auth-context";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full h-9 bg-gray-900 hover:bg-gray-700 text-white text-sm transition-colors duration-150"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
          Signing in…
        </>
      ) : (
        "Sign In"
      )}
    </Button>
  );
}

export function LoginForm() {
  const [error, setError] = useState<string>();
  const { formData, setFormData } = useAuth();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);

    if (!formData.email.trim() || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      const fd = new FormData();
      fd.append("email", formData.email);
      fd.append("password", formData.password);
      const result = await login(fd);
      if (!result.success) {
        setError(
          result.error ||
            "Invalid credentials. Please check your email and password."
        );
      }
    } catch (err: unknown) {
      setError("An error occurred during login");
      console.error("Login error:", err);
    }
  }

  const inputClass =
    "h-9 border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label
          htmlFor="login-email"
          className="text-xs font-medium text-gray-500"
        >
          Email
        </Label>
        <Input
          autoFocus
          id="login-email"
          name="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ email: e.target.value })}
          placeholder="you@example.com"
          required
          autoComplete="username"
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="login-password"
          className="text-xs font-medium text-gray-500"
        >
          Password
        </Label>
        <Input
          id="login-password"
          name="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ password: e.target.value })}
          placeholder="••••••••"
          required
          autoComplete="current-password"
          className={inputClass}
        />
        <Link
          href="/auth/reset-password"
          className="block text-right text-xs text-gray-400 hover:text-gray-600 transition-colors duration-150"
        >
          Forgot password?
        </Link>
      </div>

      {error && (
        <Alert
          variant="destructive"
          className="bg-red-50 text-red-800 border-red-200 py-2"
        >
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      <SubmitButton />
    </form>
  );
}
