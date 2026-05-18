import { describe, it, expect } from "vitest";
import {
  resumeSchema,
  sectionConfigSchema,
  jobSchema,
  simplifiedJobSchema,
  workExperienceBulletPointsSchema,
  projectAnalysisSchema,
  resumeScoreSchema,
  documentSettingsSchema,
} from "../zod-schemas";

// ─── helpers ─────────────────────────────────────────────────────────────────

function ok<T>(schema: { parse: (v: unknown) => T }, data: unknown): T {
  return schema.parse(data);
}

function fails(
  schema: { safeParse: (v: unknown) => { success: boolean } },
  data: unknown
) {
  expect(schema.safeParse(data).success).toBe(false);
}

// ─── resumeSchema ─────────────────────────────────────────────────────────────

describe("resumeSchema", () => {
  const minimal = { name: "My Resume", target_role: "Engineer" };

  it("accepts a minimal valid resume", () => {
    const result = ok(resumeSchema, minimal);
    expect(result.name).toBe("My Resume");
    expect(result.has_cover_letter).toBe(false); // default
  });

  it("rejects when name is missing", () => {
    fails(resumeSchema, { target_role: "Engineer" });
  });

  it("rejects when target_role is missing", () => {
    fails(resumeSchema, { name: "My Resume" });
  });

  it("accepts a valid email", () => {
    const result = ok(resumeSchema, { ...minimal, email: "jane@example.com" });
    expect(result.email).toBe("jane@example.com");
  });

  it("rejects an invalid email", () => {
    fails(resumeSchema, { ...minimal, email: "not-an-email" });
  });

  it("accepts a valid website URL", () => {
    const result = ok(resumeSchema, {
      ...minimal,
      website: "https://janedoe.dev",
    });
    expect(result.website).toBe("https://janedoe.dev");
  });

  it("rejects an invalid website URL", () => {
    fails(resumeSchema, { ...minimal, website: "not-a-url" });
  });

  it("accepts valid linkedin_url and github_url", () => {
    const result = ok(resumeSchema, {
      ...minimal,
      linkedin_url: "https://linkedin.com/in/jane",
      github_url: "https://github.com/jane",
    });
    expect(result.linkedin_url).toBe("https://linkedin.com/in/jane");
    expect(result.github_url).toBe("https://github.com/jane");
  });

  it("sets has_cover_letter default to false", () => {
    expect(ok(resumeSchema, minimal).has_cover_letter).toBe(false);
  });

  it("accepts has_cover_letter: true", () => {
    expect(
      ok(resumeSchema, { ...minimal, has_cover_letter: true }).has_cover_letter
    ).toBe(true);
  });
});

// ─── sectionConfigSchema ─────────────────────────────────────────────────────

describe("sectionConfigSchema", () => {
  it("accepts a visible section with no optional fields", () => {
    expect(ok(sectionConfigSchema, { visible: true }).visible).toBe(true);
  });

  it("accepts all valid style values", () => {
    for (const style of ["grouped", "list", "grid"] as const) {
      expect(ok(sectionConfigSchema, { visible: true, style }).style).toBe(
        style
      );
    }
  });

  it("rejects an unknown style value", () => {
    fails(sectionConfigSchema, { visible: true, style: "columns" });
  });

  it("accepts null for max_items", () => {
    expect(
      ok(sectionConfigSchema, { visible: true, max_items: null }).max_items
    ).toBeNull();
  });

  it("accepts a numeric max_items", () => {
    expect(
      ok(sectionConfigSchema, { visible: true, max_items: 3 }).max_items
    ).toBe(3);
  });

  it("rejects when visible is missing", () => {
    fails(sectionConfigSchema, { max_items: 2 });
  });
});

// ─── jobSchema ───────────────────────────────────────────────────────────────

const validJobBase = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  job_url: null,
  description: null,
  location: null,
  salary_range: null,
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
  work_location: null,
};

describe("jobSchema", () => {
  it("accepts a minimal valid job", () => {
    const result = ok(jobSchema, validJobBase);
    expect(result.is_active).toBe(true); // default
    expect(result.keywords).toEqual([]); // default
  });

  it("rejects an invalid UUID", () => {
    fails(jobSchema, { ...validJobBase, id: "not-a-uuid" });
  });

  it("rejects an invalid datetime for created_at", () => {
    fails(jobSchema, { ...validJobBase, created_at: "2024-01-01" });
  });

  it("preprocesses null employment_type to 'full_time'", () => {
    const result = ok(jobSchema, {
      ...validJobBase,
      employment_type: null,
    });
    expect(result.employment_type).toBe("full_time");
  });

  it("preprocesses empty string employment_type to 'full_time'", () => {
    const result = ok(jobSchema, {
      ...validJobBase,
      employment_type: "",
    });
    expect(result.employment_type).toBe("full_time");
  });

  it("preserves a valid employment_type", () => {
    const result = ok(jobSchema, {
      ...validJobBase,
      employment_type: "internship",
    });
    expect(result.employment_type).toBe("internship");
  });

  it("rejects an unknown employment_type value", () => {
    fails(jobSchema, { ...validJobBase, employment_type: "freelance" });
  });

  it("defaults is_active to true", () => {
    expect(ok(jobSchema, validJobBase).is_active).toBe(true);
  });

  it("defaults keywords to []", () => {
    expect(ok(jobSchema, validJobBase).keywords).toEqual([]);
  });
});

// ─── simplifiedJobSchema ─────────────────────────────────────────────────────

describe("simplifiedJobSchema", () => {
  it("accepts an empty object (all fields optional)", () => {
    expect(() => simplifiedJobSchema.parse({})).not.toThrow();
  });

  it("preprocesses null work_location to 'in_person'", () => {
    const result = ok(simplifiedJobSchema, { work_location: null });
    expect(result.work_location).toBe("in_person");
  });

  it("preprocesses empty string work_location to 'in_person'", () => {
    const result = ok(simplifiedJobSchema, { work_location: "" });
    expect(result.work_location).toBe("in_person");
  });

  it("preserves a valid work_location", () => {
    const result = ok(simplifiedJobSchema, { work_location: "remote" });
    expect(result.work_location).toBe("remote");
  });

  it("preprocesses null employment_type to 'full_time'", () => {
    const result = ok(simplifiedJobSchema, { employment_type: null });
    expect(result.employment_type).toBe("full_time");
  });

  // Note: .default(true).optional() — the outer .optional() short-circuits for
  // absent fields, so is_active comes back undefined (not true) when omitted.
  it("returns undefined for is_active when omitted (optional wins over default)", () => {
    expect(ok(simplifiedJobSchema, {}).is_active).toBeUndefined();
  });

  it("preserves explicit is_active value", () => {
    expect(ok(simplifiedJobSchema, { is_active: false }).is_active).toBe(false);
  });
});

// ─── workExperienceBulletPointsSchema ────────────────────────────────────────

describe("workExperienceBulletPointsSchema", () => {
  it("accepts a list of bullet points without analysis", () => {
    const result = ok(workExperienceBulletPointsSchema, {
      points: ["Built X", "Reduced latency by 30%"],
    });
    expect(result.points).toHaveLength(2);
  });

  it("accepts bullet points with analysis", () => {
    const result = ok(workExperienceBulletPointsSchema, {
      points: ["Built X"],
      analysis: {
        impact_score: 8,
        improvement_suggestions: ["Add metrics"],
      },
    });
    expect(result.analysis?.impact_score).toBe(8);
  });

  it("rejects impact_score below 1", () => {
    fails(workExperienceBulletPointsSchema, {
      points: [],
      analysis: { impact_score: 0, improvement_suggestions: [] },
    });
  });

  it("rejects impact_score above 10", () => {
    fails(workExperienceBulletPointsSchema, {
      points: [],
      analysis: { impact_score: 11, improvement_suggestions: [] },
    });
  });

  it("accepts boundary values 1 and 10", () => {
    for (const score of [1, 10]) {
      const result = ok(workExperienceBulletPointsSchema, {
        points: [],
        analysis: { impact_score: score, improvement_suggestions: [] },
      });
      expect(result.analysis?.impact_score).toBe(score);
    }
  });
});

// ─── projectAnalysisSchema ───────────────────────────────────────────────────

describe("projectAnalysisSchema", () => {
  it("accepts points with no analysis", () => {
    expect(
      ok(projectAnalysisSchema, { points: ["Launched feature"] }).points
    ).toHaveLength(1);
  });

  it("rejects impact_score out of 1–10 range", () => {
    fails(projectAnalysisSchema, {
      points: [],
      analysis: { impact_score: 0, improvement_suggestions: [] },
    });
  });
});

// ─── resumeScoreSchema ────────────────────────────────────────────────────────

const validScore = {
  overallScore: { score: 80, reason: "Good" },
  completeness: {
    contactInformation: { score: 90, reason: "Complete" },
    detailLevel: { score: 70, reason: "Adequate" },
  },
  impactScore: {
    activeVoiceUsage: { score: 85, reason: "Strong" },
    quantifiedAchievements: { score: 75, reason: "Some metrics" },
  },
  roleMatch: {
    skillsRelevance: { score: 80, reason: "Relevant" },
    experienceAlignment: { score: 85, reason: "Aligned" },
    educationFit: { score: 90, reason: "Good fit" },
  },
  overallImprovements: ["Add more metrics", "Quantify achievements"],
};

describe("resumeScoreSchema", () => {
  it("accepts a valid score object", () => {
    const result = ok(resumeScoreSchema, validScore);
    expect(result.overallScore.score).toBe(80);
  });

  it("rejects a score above 100", () => {
    fails(resumeScoreSchema, {
      ...validScore,
      overallScore: { score: 101, reason: "Over" },
    });
  });

  it("rejects a score below 0", () => {
    fails(resumeScoreSchema, {
      ...validScore,
      overallScore: { score: -1, reason: "Under" },
    });
  });

  it("accepts 0 and 100 as boundary values", () => {
    for (const score of [0, 100]) {
      expect(
        ok(resumeScoreSchema, {
          ...validScore,
          overallScore: { score, reason: "boundary" },
        }).overallScore.score
      ).toBe(score);
    }
  });

  it("accepts optional jobAlignment", () => {
    const result = ok(resumeScoreSchema, {
      ...validScore,
      jobAlignment: {
        keywordMatch: { score: 70, reason: "Some matches" },
        requirementsMatch: { score: 65, reason: "Partial" },
        companyFit: { score: 80, reason: "Good" },
      },
    });
    expect(result.jobAlignment?.keywordMatch.score).toBe(70);
  });

  it("accepts without optional jobAlignment", () => {
    const result = ok(resumeScoreSchema, validScore);
    expect(result.jobAlignment).toBeUndefined();
  });

  it("rejects when overallImprovements is missing", () => {
    const { overallImprovements: _, ...noImprovements } = validScore;
    fails(resumeScoreSchema, noImprovements);
  });
});

// ─── documentSettingsSchema ───────────────────────────────────────────────────

const validDocSettings = {
  document_font_size: 11,
  document_line_height: 1.5,
  document_margin_vertical: 36,
  document_margin_horizontal: 36,
  header_name_size: 24,
  header_name_bottom_spacing: 4,
  skills_margin_top: 0,
  skills_margin_bottom: 2,
  skills_margin_horizontal: 0,
  skills_item_spacing: 2,
  experience_margin_top: 0,
  experience_margin_bottom: 4,
  experience_margin_horizontal: 0,
  experience_item_spacing: 4,
  projects_margin_top: 0,
  projects_margin_bottom: 4,
  projects_margin_horizontal: 0,
  projects_item_spacing: 4,
  education_margin_top: 0,
  education_margin_bottom: 4,
  education_margin_horizontal: 0,
  education_item_spacing: 4,
};

describe("documentSettingsSchema", () => {
  it("accepts a complete valid settings object", () => {
    const result = ok(documentSettingsSchema, validDocSettings);
    expect(result.document_font_size).toBe(11);
  });

  it("rejects when any required field is missing", () => {
    const { document_font_size: _, ...missing } = validDocSettings;
    fails(documentSettingsSchema, missing);
  });

  it("rejects a string value for a number field", () => {
    fails(documentSettingsSchema, {
      ...validDocSettings,
      document_font_size: "11",
    });
  });
});
