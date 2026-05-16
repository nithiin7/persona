"use client";

import { Profile } from "@/lib/types";
import { User, Briefcase, GraduationCap, Code, Pencil } from "lucide-react";
import { cn, calculateProfileCompleteness } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

interface ProfileRowProps {
  profile: Profile;
}

export function ProfileRow({ profile }: ProfileRowProps) {
  const { score, missing } = calculateProfileCompleteness(profile);
  const scoreColor =
    score >= 80
      ? "text-teal-600"
      : score >= 50
        ? "text-amber-600"
        : "text-rose-600";

  return (
    <div className="border-b border-gray-200 bg-white animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Avatar + Name + Stats */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            {/* Avatar */}
            <div className="shrink-0 h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="h-4 w-4 text-gray-400" />
            </div>

            {/* Name + Progress */}
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {profile.first_name} {profile.last_name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <Progress value={score} className="h-1 w-16 shrink-0" />
                <span
                  className={cn("text-xs font-medium tabular-nums", scoreColor)}
                >
                  {score}%
                </span>
                <span className="text-xs text-gray-400 hidden sm:block">
                  {score === 100
                    ? "Profile complete"
                    : missing.length === 1
                      ? `Missing: ${missing[0]}`
                      : `${missing.length} sections missing`}
                </span>
              </div>
            </div>

            {/* Stats — visible on sm+ */}
            <div className="hidden sm:flex items-center gap-4 ml-2">
              {[
                {
                  icon: Briefcase,
                  label: "Experience",
                  count: profile.work_experience.length,
                },
                {
                  icon: GraduationCap,
                  label: "Education",
                  count: profile.education.length,
                },
                {
                  icon: Code,
                  label: "Projects",
                  count: profile.projects.length,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-1.5 text-sm text-gray-500"
                >
                  <stat.icon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <span className="font-semibold text-gray-700">
                    {stat.count}
                  </span>
                  <span className="hidden lg:inline text-gray-400">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Edit Button */}
          <Link href="/profile" className="shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200"
            >
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Edit Profile
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
