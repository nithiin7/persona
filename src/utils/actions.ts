"use server";

import { createClient } from "@/utils/supabase/server";
import {
  type ApplicationStatus,
  Profile,
  ResumeSummary,
} from "@/lib/types";

interface DashboardData {
  profile: Profile | null;
  baseResumes: ResumeSummary[];
  tailoredResumes: ResumeSummary[];
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("User not authenticated");
  }

  try {
    // Fetch profile data
    let profile;
    const { data, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    profile = data;

    // If profile doesn't exist, create one
    if (profileError?.code === "PGRST116") {
      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert([
          {
            user_id: user.id,
            first_name: null,
            last_name: null,
            email: user.email,
            phone_number: null,
            location: null,
            website: null,
            linkedin_url: null,
            github_url: null,
            work_experience: [],
            education: [],
            skills: [],
            projects: [],
          },
        ])
        .select()
        .single();

      if (createError) {
        console.error("Error creating profile:", createError);
        throw new Error("Error creating user profile");
      }

      profile = newProfile;
    } else if (profileError) {
      console.error("Error fetching profile:", profileError);
      throw new Error("Error fetching dashboard data");
    }

    // Fetch resumes data
    const { data: resumes, error: resumesError } = await supabase
      .from("resumes")
      .select(
        "id, user_id, name, target_role, is_base_resume, job_id, created_at, updated_at, skills, match_score"
      )
      .eq("user_id", user.id);

    if (resumesError) {
      console.error("Error fetching resumes:", resumesError);
      throw new Error("Error fetching dashboard data");
    }

    const sanitizedResumes =
      resumes?.map((resume) => ({
        ...resume,
        target_role: resume.target_role || "",
      })) ?? [];

    const baseResumes = sanitizedResumes.filter(
      (resume) => resume.is_base_resume
    );
    const rawTailored = sanitizedResumes.filter(
      (resume) => !resume.is_base_resume
    );

    // Fetch application_status for tailored resumes from their linked jobs
    const jobIds = rawTailored
      .map((r) => r.job_id)
      .filter((id): id is string => !!id);

    let jobStatusMap: Record<string, string | null> = {};
    if (jobIds.length > 0) {
      const { data: jobs } = await supabase
        .from("jobs")
        .select("id, application_status")
        .in("id", jobIds);
      jobStatusMap = Object.fromEntries(
        (jobs ?? []).map((j) => [j.id, j.application_status])
      );
    }

    const tailoredResumes = rawTailored.map((resume) => {
      const { skills: _skills, match_score, ...rest } = resume as typeof resume & {
        skills?: unknown[];
        match_score?: number | null;
      };
      return {
        ...rest,
        application_status: (resume.job_id
          ? (jobStatusMap[resume.job_id] ?? null)
          : null) as ApplicationStatus | null,
        matchScore: match_score ?? undefined,
      };
    });

    return {
      profile,
      baseResumes,
      tailoredResumes,
    };
  } catch (error) {
    if (error instanceof Error && error.message === "User not authenticated") {
      return {
        profile: null,
        baseResumes: [],
        tailoredResumes: [],
      };
    }
    throw error;
  }
}
