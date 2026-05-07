import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Profile } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export interface ProfileCompletenessResult {
  score: number;
  missing: string[];
}

export function calculateProfileCompleteness(
  profile: Profile
): ProfileCompletenessResult {
  const checks: { label: string; points: number; met: boolean }[] = [
    {
      label: "First & last name",
      points: 10,
      met: !!(profile.first_name && profile.last_name),
    },
    { label: "Phone number", points: 5, met: !!profile.phone_number },
    { label: "Location", points: 5, met: !!profile.location },
    { label: "LinkedIn URL", points: 10, met: !!profile.linkedin_url },
    {
      label: "GitHub or website",
      points: 5,
      met: !!(profile.github_url || profile.website),
    },
    {
      label: "Work experience",
      points: 25,
      met: profile.work_experience.length > 0,
    },
    { label: "Education", points: 15, met: profile.education.length > 0 },
    { label: "Skills", points: 15, met: profile.skills.length > 0 },
    { label: "Projects", points: 10, met: profile.projects.length > 0 },
  ];

  const score = checks
    .filter((c) => c.met)
    .reduce((sum, c) => sum + c.points, 0);
  const missing = checks.filter((c) => !c.met).map((c) => c.label);

  return { score, missing };
}

export function sanitizeUnknownStrings<T>(data: T): T {
  if (typeof data === "string") {
    return (data === "<UNKNOWN>" ? "" : data) as T;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeUnknownStrings(item)) as T;
  }
  if (typeof data === "object" && data !== null) {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        sanitizeUnknownStrings(value),
      ])
    ) as T;
  }
  return data;
}
