"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";
import { Button } from "@/components/ui/button";
import { Github, Loader2, Sparkles } from "lucide-react";
import { AuthProvider } from "./auth-context";
import { signInWithGithub } from "@/app/auth/login/actions";

interface AuthDialogProps {
  children?: React.ReactNode;
}

function SocialAuth() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGithubSignIn = async () => {
    try {
      setIsLoading(true);
      const result = await signInWithGithub();
      if (!result.success) {
        console.error("GitHub sign in error:", result.error);
      } else if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error("Failed to sign in with GitHub:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3 mt-5">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-100" />
        <span className="text-xs text-gray-400">or</span>
        <div className="h-px flex-1 bg-gray-100" />
      </div>
      <Button
        variant="outline"
        className="w-full h-9 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 text-gray-600 text-sm font-medium transition-colors duration-150"
        onClick={handleGithubSignIn}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            Connecting…
          </>
        ) : (
          <>
            <Github className="mr-2 h-3.5 w-3.5" />
            Continue with GitHub
          </>
        )}
      </Button>
    </div>
  );
}

export function AuthDialog({ children }: AuthDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-gray-900 hover:bg-gray-700 text-white transition-colors duration-150">
            Get Started
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[400px] p-0 bg-white border border-gray-200 shadow-lg rounded-2xl overflow-hidden">
        <AuthProvider>
          <DialogTitle className="sr-only">Sign in to Persona</DialogTitle>
          <DialogDescription className="sr-only">
            Sign in or create a Persona account
          </DialogDescription>

          {/* Brand header */}
          <div className="px-7 pt-7 pb-5 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-7 w-7 rounded-lg bg-gray-900 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              </div>
              <span className="text-sm font-semibold text-gray-900">
                Persona
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {activeTab === "login"
                ? "Welcome back. Sign in to continue."
                : "Create your free account to get started."}
            </p>
          </div>

          {/* Tabs + forms */}
          <div className="px-7 pt-5 pb-7">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as "login" | "signup")}
              className="w-full"
            >
              <TabsList className="w-full h-9 bg-gray-100 border-0 p-1 rounded-lg gap-0.5">
                <TabsTrigger
                  value="login"
                  className="flex-1 h-7 rounded-md text-xs font-medium text-gray-500
                    data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm
                    data-[state=inactive]:hover:text-gray-700
                    border-0 shadow-none transition-all duration-150 focus-visible:outline-none"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="flex-1 h-7 rounded-md text-xs font-medium text-gray-500
                    data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm
                    data-[state=inactive]:hover:text-gray-700
                    border-0 shadow-none transition-all duration-150 focus-visible:outline-none"
                >
                  Create Account
                </TabsTrigger>
              </TabsList>

              <div className="mt-5">
                <TabsContent value="login" className="mt-0">
                  <LoginForm />
                  <SocialAuth />
                </TabsContent>
                <TabsContent value="signup" className="mt-0">
                  <SignupForm />
                  <SocialAuth />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </AuthProvider>
      </DialogContent>
    </Dialog>
  );
}
