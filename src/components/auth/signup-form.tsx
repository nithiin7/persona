"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signup } from "@/app/auth/login/actions";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Loader2 } from "lucide-react";
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
          Creating account…
        </>
      ) : (
        "Create Account"
      )}
    </Button>
  );
}

// Pure sync validators — no React state dependency
function validateSync(
  name: string,
  email: string,
  password: string
): string | null {
  if (!name.trim() || name.trim().length < 2)
    return "Name must be at least 2 characters.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return "Please enter a valid email address.";
  if (password.length < 6) return "Password must be at least 6 characters.";
  if (!/[A-Z]/.test(password))
    return "Password must contain at least one uppercase letter.";
  if (!/[0-9]/.test(password))
    return "Password must contain at least one number.";
  return null;
}

interface FormState {
  error?: string;
  success?: boolean;
}

export function SignupForm() {
  const [formState, setFormState] = useState<FormState>({});
  const { formData, setFormData } = useAuth();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState({});

    const validationError = validateSync(
      formData.name || "",
      formData.email,
      formData.password
    );

    if (validationError) {
      setFormState({ error: validationError });
      return;
    }

    try {
      const fd = new FormData();
      fd.append("email", formData.email);
      fd.append("password", formData.password);
      fd.append("name", formData.name || "");

      const result = await signup(fd);
      if (!result.success) {
        setFormState({ error: result.error || "Failed to create account" });
        return;
      }
      setFormState({ success: true });
    } catch (err: unknown) {
      console.error("Signup error:", err);
      setFormState({ error: "An unexpected error occurred" });
    }
  }

  const inputClass =
    "h-9 border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0";
  const labelClass = "text-xs font-medium text-gray-500";

  if (formState.success) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">Check your email</p>
          <p className="text-xs text-gray-500 mt-1">
            We sent a confirmation link to{" "}
            <span className="font-medium">{formData.email}</span>
          </p>
        </div>
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
        <Label htmlFor="name" className={labelClass}>
          Full Name
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ name: e.target.value })}
          placeholder="John Doe"
          required
          autoFocus
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" className={labelClass}>
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          value={formData.email}
          onChange={(e) => setFormData({ email: e.target.value })}
          placeholder="you@example.com"
          required
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className={labelClass}>
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={formData.password}
          onChange={(e) => setFormData({ password: e.target.value })}
          placeholder="••••••••"
          required
          className={inputClass}
        />
        <p className="text-[11px] text-gray-400">
          Min. 6 characters, one uppercase letter and one number
        </p>
      </div>

      <SubmitButton />
    </form>
  );
}
