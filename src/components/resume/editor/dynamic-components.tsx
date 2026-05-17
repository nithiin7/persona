import dynamic from "next/dynamic";
import React from "react";
import type { ComponentType } from "react";
import { LoadingFallback } from "./shared/LoadingFallback";
import type {
  WorkExperience,
  Education,
  Skill,
  Project,
  Certification,
  Publication,
  Volunteer,
  Language,
  Award,
  DocumentSettings,
  Resume,
  ResumeTemplate,
} from "@/lib/types";

interface WorkExperienceFormProps {
  experiences: WorkExperience[];
  onChange: (experiences: WorkExperience[]) => void;
  profile: { work_experience: WorkExperience[] };
  targetRole?: string;
}

interface ProjectsFormProps {
  projects: Project[];
  onChange: (projects: Project[]) => void;
  profile: { projects: Project[] };
}

interface EducationFormProps {
  education: Education[];
  onChange: (education: Education[]) => void;
  profile: { education: Education[] };
}

interface SkillsFormProps {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
  profile: { skills: Skill[] };
}

interface CertificationsFormProps {
  certifications: Certification[];
  onChange: (certifications: Certification[]) => void;
  profile: { certifications?: Certification[] };
}

interface PublicationsFormProps {
  publications: Publication[];
  onChange: (publications: Publication[]) => void;
  profile: { publications?: Publication[] };
}

interface VolunteerFormProps {
  volunteer: Volunteer[];
  onChange: (volunteer: Volunteer[]) => void;
  profile: { volunteer?: Volunteer[] };
}

interface LanguagesFormProps {
  languages: Language[];
  onChange: (languages: Language[]) => void;
  profile: { languages?: Language[] };
}

interface AwardsFormProps {
  awards: Award[];
  onChange: (awards: Award[]) => void;
  profile: { awards?: Award[] };
}

export const WorkExperienceForm = dynamic(
  () =>
    import("./forms/work-experience-form").then((mod) => ({
      default: mod.WorkExperienceForm,
    })) as Promise<ComponentType<WorkExperienceFormProps>>,
  {
    loading: () => <LoadingFallback lines={2} />,
    ssr: false,
  }
);

export const EducationForm = dynamic(
  () =>
    import("./forms/education-form").then((mod) => ({
      default: mod.EducationForm,
    })) as Promise<ComponentType<EducationFormProps>>,
  {
    loading: () => <LoadingFallback lines={1} />,
    ssr: false,
  }
);

export const SkillsForm = dynamic(
  () =>
    import("./forms/skills-form").then((mod) => ({
      default: mod.SkillsForm,
    })) as Promise<ComponentType<SkillsFormProps>>,
  {
    loading: () => <LoadingFallback lines={1} />,
    ssr: false,
  }
);

export const ProjectsForm = dynamic(
  () =>
    import("./forms/projects-form").then((mod) => ({
      default: mod.ProjectsForm,
    })) as Promise<ComponentType<ProjectsFormProps>>,
  {
    loading: () => <LoadingFallback lines={1} />,
    ssr: false,
  }
);

export const CertificationsForm = dynamic(
  () =>
    import("./forms/certifications-form").then((mod) => ({
      default: mod.CertificationsForm,
    })) as Promise<ComponentType<CertificationsFormProps>>,
  {
    loading: () => <LoadingFallback lines={1} />,
    ssr: false,
  }
);

export const PublicationsForm = dynamic(
  () =>
    import("./forms/publications-form").then((mod) => ({
      default: mod.PublicationsForm,
    })) as Promise<ComponentType<PublicationsFormProps>>,
  {
    loading: () => <LoadingFallback lines={1} />,
    ssr: false,
  }
);

export const VolunteerForm = dynamic(
  () =>
    import("./forms/volunteer-form").then((mod) => ({
      default: mod.VolunteerForm,
    })) as Promise<ComponentType<VolunteerFormProps>>,
  {
    loading: () => <LoadingFallback lines={1} />,
    ssr: false,
  }
);

export const LanguagesForm = dynamic(
  () =>
    import("./forms/languages-form").then((mod) => ({
      default: mod.LanguagesForm,
    })) as Promise<ComponentType<LanguagesFormProps>>,
  {
    loading: () => <LoadingFallback lines={1} />,
    ssr: false,
  }
);

export const AwardsForm = dynamic(
  () =>
    import("./forms/awards-form").then((mod) => ({
      default: mod.AwardsForm,
    })) as Promise<ComponentType<AwardsFormProps>>,
  {
    loading: () => <LoadingFallback lines={1} />,
    ssr: false,
  }
);

export const DocumentSettingsForm = dynamic(
  () =>
    import("./forms/document-settings-form").then((mod) => ({
      default: mod.DocumentSettingsForm,
    })) as Promise<
      ComponentType<{
        resume?: Resume;
        documentSettings: DocumentSettings;
        onChange: (
          field:
            | "document_settings"
            | "template"
            | "section_order"
            | "section_configs",
          value:
            | DocumentSettings
            | ResumeTemplate
            | string[]
            | Record<string, { visible: boolean }>
        ) => void;
        onTemplateChange?: (template: ResumeTemplate) => void;
      }>
    >,
  {
    loading: () => <LoadingFallback lines={1} />,
    ssr: false,
  }
);
