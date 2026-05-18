import { describe, it, expect, vi, afterEach } from "vitest";
import {
  cn,
  getGreeting,
  calculateProfileCompleteness,
  getResumeFileName,
  sanitizeUnknownStrings,
} from "../utils";
import type { Profile, Resume, Job } from "../types";

// ─── cn ──────────────────────────────────────────────────────────────────────

describe("cn", () => {
  it("merges class strings", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("deduplicates conflicting Tailwind classes, keeping the last", () => {
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });

  it("drops falsy values", () => {
    expect(cn("foo", false, undefined, null, "bar")).toBe("foo bar");
  });

  it("handles conditional object syntax", () => {
    expect(cn({ "text-red-500": true, "text-blue-500": false })).toBe(
      "text-red-500"
    );
  });
});

// ─── getGreeting ─────────────────────────────────────────────────────────────

describe("getGreeting", () => {
  afterEach(() => vi.useRealTimers());

  it.each([
    [6, "Good Morning"],
    [11, "Good Morning"],
    [12, "Good Afternoon"],
    [16, "Good Afternoon"],
    [17, "Good Evening"],
    [23, "Good Evening"],
  ])("returns '%s' for hour %i", (hour, expected) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 0, 1, hour, 0, 0));
    expect(getGreeting()).toBe(expected);
  });
});

// ─── calculateProfileCompleteness ────────────────────────────────────────────

const emptyProfile: Profile = {
  id: "1",
  user_id: "u1",
  first_name: null,
  last_name: null,
  email: null,
  phone_number: null,
  location: null,
  linkedin_url: null,
  github_url: null,
  website: null,
  work_experience: [],
  education: [],
  skills: [],
  projects: [],
  created_at: "",
  updated_at: "",
};

describe("calculateProfileCompleteness", () => {
  it("returns 0 and all fields missing for an empty profile", () => {
    const { score, missing } = calculateProfileCompleteness(emptyProfile);
    expect(score).toBe(0);
    expect(missing).toHaveLength(9);
  });

  it("awards correct points for each section", () => {
    const profile: Profile = {
      ...emptyProfile,
      first_name: "Jane",
      last_name: "Doe",
      phone_number: "555-0100",
      location: "NYC",
      linkedin_url: "https://linkedin.com/in/janedoe",
      github_url: "https://github.com/janedoe",
      website: null,
      work_experience: [
        {
          company: "Acme",
          position: "Engineer",
          date: "2020–2022",
          location: "",
          description: [],
          technologies: [],
        },
      ],
      education: [
        {
          school: "MIT",
          degree: "BS",
          field: "CS",
          date: "2020",
          location: "",
          gpa: "",
          achievements: [],
        },
      ],
      skills: [{ category: "Languages", items: ["TypeScript"] }],
      projects: [
        {
          name: "Proj",
          description: [],
          technologies: [],
          date: "",
          url: "",
          github_url: "",
        },
      ],
    };

    const { score, missing } = calculateProfileCompleteness(profile);
    // 10+5+5+10+5+25+15+15+10 = 100
    expect(score).toBe(100);
    expect(missing).toHaveLength(0);
  });

  it("reports missing sections when only name is provided", () => {
    const profile: Profile = {
      ...emptyProfile,
      first_name: "Jane",
      last_name: "Doe",
    };
    const { score, missing } = calculateProfileCompleteness(profile);
    expect(score).toBe(10);
    expect(missing).toContain("Work experience");
    expect(missing).toContain("Education");
    expect(missing).toContain("Skills");
  });
});

// ─── getResumeFileName ────────────────────────────────────────────────────────

const baseResume: Resume = {
  id: "r1",
  user_id: "u1",
  name: "My Resume",
  first_name: "Jane",
  last_name: "Doe",
  email: "",
  phone_number: "",
  location: "",
  linkedin_url: "",
  github_url: "",
  website: "",
  summary: "",
  work_experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  is_base_resume: true,
  job_id: null,
  section_order: [],
  section_configs: {},
  document_settings: {},
  template: "classic",
  created_at: "",
  updated_at: "",
  has_cover_letter: false,
  custom_instructions: null,
} as unknown as Resume;

describe("getResumeFileName", () => {
  it("uses full name for base resume", () => {
    expect(getResumeFileName(baseResume, null, "pdf")).toBe(
      "Jane_Doe_Resume.pdf"
    );
  });

  it("includes company name for tailored resumes", () => {
    const tailored: Resume = { ...baseResume, is_base_resume: false };
    const job: Job = {
      id: "j1",
      user_id: "u1",
      company_name: "Acme Corp",
      position_title: "Engineer",
      job_description: "",
      created_at: "",
      updated_at: "",
      location: "",
      salary_range: "",
      keywords: [],
      status: "active",
    } as unknown as Job;
    expect(getResumeFileName(tailored, job, "docx")).toBe(
      "Jane_D_Resume_Acme_Corp.docx"
    );
  });

  it("strips special characters from company name", () => {
    const tailored: Resume = { ...baseResume, is_base_resume: false };
    const job: Job = {
      id: "j1",
      company_name: "Foo & Bar, Inc.",
    } as unknown as Job;
    expect(getResumeFileName(tailored, job, "pdf")).toBe(
      "Jane_D_Resume_Foo_Bar_Inc.pdf"
    );
  });

  it("falls back gracefully when last name is absent", () => {
    const noLast: Resume = { ...baseResume, last_name: "" };
    expect(getResumeFileName(noLast, null, "pdf")).toBe("Jane_Resume.pdf");
  });
});

// ─── sanitizeUnknownStrings ───────────────────────────────────────────────────

describe("sanitizeUnknownStrings", () => {
  it("replaces '<UNKNOWN>' strings with empty string", () => {
    expect(sanitizeUnknownStrings("<UNKNOWN>")).toBe("");
  });

  it("leaves normal strings unchanged", () => {
    expect(sanitizeUnknownStrings("hello")).toBe("hello");
  });

  it("recursively sanitizes arrays", () => {
    expect(sanitizeUnknownStrings(["<UNKNOWN>", "ok"])).toEqual(["", "ok"]);
  });

  it("recursively sanitizes nested objects", () => {
    const input = { name: "<UNKNOWN>", title: "Engineer" };
    expect(sanitizeUnknownStrings(input)).toEqual({
      name: "",
      title: "Engineer",
    });
  });

  it("passes through non-string primitives unchanged", () => {
    expect(sanitizeUnknownStrings(42)).toBe(42);
    expect(sanitizeUnknownStrings(true)).toBe(true);
    expect(sanitizeUnknownStrings(null)).toBe(null);
  });
});
