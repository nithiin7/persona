/**
 * Home Page Component
 *
 * This is the main dashboard page of the Resume AI application. It displays:
 * - User profile information
 * - Quick stats (profile score, resume counts, job postings)
 * - Base resume management
 * - Tailored resume management
 *
 * The page implements a soft gradient minimalism design with floating orbs
 * and mesh overlay for visual interest.
 */

import { redirect } from "next/navigation";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProfileRow } from "@/components/dashboard/profile-row";
import { WelcomeDialog } from "@/components/dashboard/welcome-dialog";
import { getGreeting } from "@/lib/utils";
import { ApiKeyAlert } from "@/components/dashboard/api-key-alert";
import {
  type SortOption,
  type SortDirection,
} from "@/components/resume/management/resume-sort-controls";
import type { ResumeSummary } from "@/lib/types";
import { ResumesSection } from "@/components/dashboard/resumes-section";
import { getDashboardData } from "@/utils/actions";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  // Check if user is coming from confirmation
  const params = await searchParams;
  const isNewSignup = params?.type === "signup" && params?.token_hash;

  // Fetch dashboard data and handle authentication
  let data;
  try {
    data = await getDashboardData();
    if (!data.profile) {
      redirect("/");
    }
  } catch {
    // Redirect to login if error occurs
    redirect("/");
  }

  const {
    profile,
    baseResumes: unsortedBaseResumes,
    tailoredResumes: unsortedTailoredResumes,
  } = data;

  // Get sort parameters for both sections
  const baseSort = (params.baseSort as SortOption) || "createdAt";
  const baseDirection = (params.baseDirection as SortDirection) || "asc";
  const tailoredSort = (params.tailoredSort as SortOption) || "createdAt";
  const tailoredDirection =
    (params.tailoredDirection as SortDirection) || "asc";

  // Sort function
  function sortResumes(
    resumes: ResumeSummary[],
    sort: SortOption,
    direction: SortDirection
  ) {
    return [...resumes].sort((a, b) => {
      const modifier = direction === "asc" ? 1 : -1;
      switch (sort) {
        case "name":
          return modifier * a.name.localeCompare(b.name);
        case "jobTitle":
          return (
            modifier *
            ((a.target_role || "").localeCompare(b.target_role || "") || 0)
          );
        case "createdAt":
        default:
          return (
            modifier *
            (new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime())
          );
      }
    });
  }

  // Sort both resume lists
  const baseResumes = sortResumes(unsortedBaseResumes, baseSort, baseDirection);
  const tailoredResumes = sortResumes(
    unsortedTailoredResumes,
    tailoredSort,
    tailoredDirection
  );

  const isProPlan = true;
  const canCreateBase = true;
  const canCreateTailored = true;

  // Display a friendly message if no profile exists
  if (!profile) {
    return (
      <main className="min-h-screen p-6 md:p-8 lg:p-10 relative flex items-center justify-center">
        <Card className="max-w-md w-full p-8 bg-white/80 backdrop-blur-xl border-white/40 shadow-2xl">
          <div className="text-center space-y-4">
            <User className="w-12 h-12 text-muted-foreground mx-auto" />
            <h2 className="text-2xl font-semibold text-gray-800">
              Profile Not Found
            </h2>
            <p className="text-muted-foreground">
              We couldn&apos;t find your profile information. Please contact
              support for assistance.
            </p>
            <Button className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
              Contact Support
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative sm:pb-12 pb-40">
      {/* Welcome Dialog for New Signups */}
      <WelcomeDialog isOpen={!!isNewSignup} />

      {/* Clean Background */}
      <div className="fixed inset-0 z-0 bg-gray-50">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-70" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Profile Row Component */}
        <ProfileRow profile={profile} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="mb-8 space-y-6">
            {/* API Key Alert */}
            {!isProPlan && <ApiKeyAlert />}

            {/* Greeting */}
            <div className="animate-fade-up">
              <h1 className="text-2xl font-semibold text-gray-900">
                {getGreeting()}, {profile.first_name}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Welcome to your resume dashboard
              </p>
            </div>

            {/* Base Resumes Section */}
            <div className="animate-fade-up" style={{ animationDelay: "80ms" }}>
              <ResumesSection
                type="base"
                resumes={baseResumes}
                profile={profile}
                sortParam="baseSort"
                directionParam="baseDirection"
                currentSort={baseSort}
                currentDirection={baseDirection}
                canCreateMore={canCreateBase}
              />
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-200" />

            {/* Tailored Resumes Section */}
            <div
              className="animate-fade-up"
              style={{ animationDelay: "160ms" }}
            >
              <ResumesSection
                type="tailored"
                resumes={tailoredResumes}
                profile={profile}
                sortParam="tailoredSort"
                directionParam="tailoredDirection"
                currentSort={tailoredSort}
                currentDirection={tailoredDirection}
                baseResumes={baseResumes}
                canCreateMore={canCreateTailored}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
