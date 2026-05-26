"use client";

import { Resume, Profile, Job } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion } from "@/components/ui/accordion";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Suspense, useRef, useState, useEffect, useCallback } from "react";
import { ResumeEditorActions } from "../actions/resume-editor-actions";
import { TailoredJobAccordion } from "../../management/cards/tailored-job-card";
import { BasicInfoForm } from "../forms/basic-info-form";
import ChatBot from "../../assistant/chatbot";
import { CoverLetterPanel } from "./cover-letter-panel";
import {
  WorkExperienceForm,
  EducationForm,
  SkillsForm,
  ProjectsForm,
  CertificationsForm,
  PublicationsForm,
  VolunteerForm,
  LanguagesForm,
  AwardsForm,
  DocumentSettingsForm,
} from "../dynamic-components";
import { ResumeEditorTabs } from "../header/resume-editor-tabs";
import ResumeScorePanel from "./resume-score-panel";
import { KeywordHighlightBar } from "./keyword-highlight-bar";

interface EditorPanelProps {
  resume: Resume;
  profile: Profile;
  job: Job | null;
  isLoadingJob: boolean;
  onResumeChange: (field: keyof Resume, value: Resume[keyof Resume]) => void;
}

const SCORE_STORAGE_KEY = "persona-resume-scores";

export function EditorPanel({
  resume,
  profile,
  job,
  isLoadingJob,
  onResumeChange,
}: EditorPanelProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [highlightKeywords, setHighlightKeywords] = useState<{
    matched: string[];
    missing: string[];
  } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SCORE_STORAGE_KEY);
      if (!stored) return;
      const scores = new Map(JSON.parse(stored));
      const score = scores.get(resume.id) as {
        jobAlignment?: {
          keywordMatch?: {
            matchedKeywords?: string[];
            missingKeywords?: string[];
          };
        };
      } | null;
      const km = score?.jobAlignment?.keywordMatch;
      if (km?.matchedKeywords?.length || km?.missingKeywords?.length) {
        setHighlightKeywords({
          matched: km.matchedKeywords ?? [],
          missing: km.missingKeywords ?? [],
        });
      }
    } catch {
      // ignore storage errors
    }
  }, [resume.id]);

  const handleKeywordsChange = useCallback(
    (matched: string[], missing: string[]) => {
      setHighlightKeywords({ matched, missing });
    },
    []
  );

  return (
    <div className="flex flex-col sm:mr-4 relative h-full max-h-full  ">
      <div className="flex-1 flex flex-col overflow-scroll">
        <ScrollArea className="flex-1 sm:pr-2" ref={scrollAreaRef}>
          <div className="relative pb-36">
            {/* Tabs wraps everything so TabsList can be sticky alongside the actions bar */}
            <Tabs defaultValue="basic" className="mb-4">
              <div className="sticky top-0 z-20 bg-white border-b border-gray-100">
                <div className="flex flex-col gap-4">
                  <ResumeEditorActions
                    onResumeChange={onResumeChange}
                    job={job}
                  />
                </div>
                <div className="pb-2">
                  <ResumeEditorTabs />
                </div>
              </div>

              {/* Tailored Job Accordion */}
              <Accordion
                type="single"
                collapsible
                defaultValue="basic"
                className="mt-6"
              >
                <TailoredJobAccordion
                  resume={resume}
                  job={job}
                  isLoading={isLoadingJob}
                />
              </Accordion>

              {highlightKeywords && (
                <KeywordHighlightBar
                  matchedKeywords={highlightKeywords.matched}
                  missingKeywords={highlightKeywords.missing}
                />
              )}

              {/* Basic Info Form */}
              <TabsContent value="basic">
                <BasicInfoForm profile={profile} />
              </TabsContent>

              {/* Work Experience Form */}
              <TabsContent value="work">
                <Suspense
                  fallback={
                    <div className="space-y-4 animate-pulse">
                      <div className="h-8 bg-muted rounded-md w-1/3" />
                      <div className="h-24 bg-muted rounded-md" />
                      <div className="h-24 bg-muted rounded-md" />
                    </div>
                  }
                >
                  <WorkExperienceForm
                    experiences={resume.work_experience}
                    onChange={(experiences) =>
                      onResumeChange("work_experience", experiences)
                    }
                    profile={profile}
                    targetRole={resume.target_role}
                    job={job}
                  />
                </Suspense>
              </TabsContent>

              {/* Projects Form */}
              <TabsContent value="projects">
                <Suspense
                  fallback={
                    <div className="space-y-4 animate-pulse">
                      <div className="h-8 bg-muted rounded-md w-1/3" />
                      <div className="h-24 bg-muted rounded-md" />
                    </div>
                  }
                >
                  <ProjectsForm
                    projects={resume.projects}
                    onChange={(projects) =>
                      onResumeChange("projects", projects)
                    }
                    profile={profile}
                    targetRole={resume.target_role}
                    job={job}
                  />
                </Suspense>
              </TabsContent>

              {/* Education Form */}
              <TabsContent value="education">
                <Suspense
                  fallback={
                    <div className="space-y-4 animate-pulse">
                      <div className="h-8 bg-muted rounded-md w-1/3" />
                      <div className="h-24 bg-muted rounded-md" />
                    </div>
                  }
                >
                  <EducationForm
                    education={resume.education}
                    onChange={(education) =>
                      onResumeChange("education", education)
                    }
                    profile={profile}
                  />
                </Suspense>
              </TabsContent>

              {/* Skills Form */}
              <TabsContent value="skills">
                <Suspense
                  fallback={
                    <div className="space-y-4 animate-pulse">
                      <div className="h-8 bg-muted rounded-md w-1/3" />
                      <div className="h-24 bg-muted rounded-md" />
                    </div>
                  }
                >
                  <SkillsForm
                    skills={resume.skills}
                    onChange={(skills) => onResumeChange("skills", skills)}
                    profile={profile}
                  />
                </Suspense>
              </TabsContent>

              {/* Certifications Form */}
              <TabsContent value="certifications">
                <Suspense
                  fallback={
                    <div className="space-y-4 animate-pulse">
                      <div className="h-8 bg-muted rounded-md w-1/3" />
                      <div className="h-24 bg-muted rounded-md" />
                    </div>
                  }
                >
                  <CertificationsForm
                    certifications={resume.certifications || []}
                    onChange={(certifications) =>
                      onResumeChange("certifications", certifications)
                    }
                    profile={profile}
                  />
                </Suspense>
              </TabsContent>

              {/* Publications Form */}
              <TabsContent value="publications">
                <Suspense
                  fallback={
                    <div className="space-y-4 animate-pulse">
                      <div className="h-8 bg-muted rounded-md w-1/3" />
                      <div className="h-24 bg-muted rounded-md" />
                    </div>
                  }
                >
                  <PublicationsForm
                    publications={resume.publications || []}
                    onChange={(publications) =>
                      onResumeChange("publications", publications)
                    }
                    profile={profile}
                  />
                </Suspense>
              </TabsContent>

              {/* Volunteer Form */}
              <TabsContent value="volunteer">
                <Suspense
                  fallback={
                    <div className="space-y-4 animate-pulse">
                      <div className="h-8 bg-muted rounded-md w-1/3" />
                      <div className="h-24 bg-muted rounded-md" />
                    </div>
                  }
                >
                  <VolunteerForm
                    volunteer={resume.volunteer || []}
                    onChange={(volunteer) =>
                      onResumeChange("volunteer", volunteer)
                    }
                    profile={profile}
                  />
                </Suspense>
              </TabsContent>

              {/* Languages Form */}
              <TabsContent value="languages">
                <Suspense
                  fallback={
                    <div className="space-y-4 animate-pulse">
                      <div className="h-8 bg-muted rounded-md w-1/3" />
                      <div className="h-24 bg-muted rounded-md" />
                    </div>
                  }
                >
                  <LanguagesForm
                    languages={resume.languages || []}
                    onChange={(languages) =>
                      onResumeChange("languages", languages)
                    }
                    profile={profile}
                  />
                </Suspense>
              </TabsContent>

              {/* Awards Form */}
              <TabsContent value="awards">
                <Suspense
                  fallback={
                    <div className="space-y-4 animate-pulse">
                      <div className="h-8 bg-muted rounded-md w-1/3" />
                      <div className="h-24 bg-muted rounded-md" />
                    </div>
                  }
                >
                  <AwardsForm
                    awards={resume.awards || []}
                    onChange={(awards) => onResumeChange("awards", awards)}
                    profile={profile}
                  />
                </Suspense>
              </TabsContent>

              {/* Document Settings Form */}
              <TabsContent value="settings">
                <Suspense
                  fallback={
                    <div className="space-y-4 animate-pulse">
                      <div className="h-8 bg-muted rounded-md w-1/3" />
                      <div className="h-24 bg-muted rounded-md" />
                    </div>
                  }
                >
                  <DocumentSettingsForm
                    resume={resume}
                    documentSettings={resume.document_settings!}
                    onChange={(_field, value) => {
                      if (_field === "template") {
                        onResumeChange("template", value);
                      } else if (_field === "section_order") {
                        onResumeChange("section_order", value);
                      } else if (_field === "section_configs") {
                        onResumeChange("section_configs", value);
                      } else {
                        onResumeChange("document_settings", value);
                      }
                    }}
                    onTemplateChange={(template) => {
                      onResumeChange("template", template);
                    }}
                  />
                </Suspense>
              </TabsContent>

              {/* Cover Letter Form */}
              <TabsContent value="cover-letter">
                <CoverLetterPanel resume={resume} job={job} />
              </TabsContent>

              {/* Resume Score Form */}
              <TabsContent value="resume-score">
                <ResumeScorePanel
                  resume={resume}
                  job={job}
                  onKeywordsChange={handleKeywordsChange}
                />
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </div>

      <div className="absolute w-full bottom-0">
        <ChatBot resume={resume} onResumeChange={onResumeChange} job={job} />
      </div>
    </div>
  );
}
