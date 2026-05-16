"use client";

import {
  User,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Wrench,
  LayoutTemplate,
  Award,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

const editTrigger =
  "flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-md text-[11px] font-medium text-gray-500 " +
  "transition-colors duration-150 hover:text-gray-800 " +
  "data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 data-[state=active]:shadow-none";

const toolTrigger =
  "flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-md text-[11px] font-medium text-gray-400 " +
  "transition-colors duration-150 hover:text-violet-600 " +
  "data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700 data-[state=active]:shadow-none";

const listClass =
  "w-full h-auto bg-white border border-gray-200 rounded-lg p-0.5 shadow-none gap-0.5";

const contentTabs = [
  { value: "basic", icon: User, label: "Basic" },
  { value: "work", icon: Briefcase, label: "Work" },
  { value: "projects", icon: FolderGit2, label: "Projects" },
  { value: "education", icon: GraduationCap, label: "Education" },
  { value: "skills", icon: Wrench, label: "Skills" },
  { value: "certifications", icon: Award, label: "Certs" },
];

const toolTabs = [
  { value: "settings", icon: LayoutTemplate, label: "Layout" },
  { value: "resume-score", icon: CheckCircle2, label: "Score" },
  { value: "cover-letter", icon: FileText, label: "Cover Letter" },
];

export function ResumeEditorTabs() {
  return (
    <div className="space-y-1 my-3">
      {/* Content editing tabs — 3×2 grid */}
      <TabsList className={`${listClass} grid grid-cols-3`}>
        {contentTabs.map(({ value, icon: Icon, label }) => (
          <TabsTrigger key={value} value={value} className={editTrigger}>
            <Icon className="h-3.5 w-3.5 shrink-0" />
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* Tools row — 3 cols, violet AI accent for score & cover letter */}
      <TabsList className={`${listClass} grid grid-cols-3`}>
        {toolTabs.map(({ value, icon: Icon, label }) => (
          <TabsTrigger key={value} value={value} className={toolTrigger}>
            <Icon className="h-3.5 w-3.5 shrink-0" />
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
}
