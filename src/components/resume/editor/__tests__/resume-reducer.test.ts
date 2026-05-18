import { describe, it, expect } from "vitest";
import { resumeReducer } from "../resume-editor-context";
import type { Resume } from "@/lib/types";

// ─── fixtures ─────────────────────────────────────────────────────────────────

const baseResume: Resume = {
  id: "r1",
  user_id: "u1",
  name: "Test Resume",
  first_name: "Jane",
  last_name: "Doe",
  email: "jane@example.com",
  phone_number: null,
  location: null,
  linkedin_url: null,
  github_url: null,
  website: null,
  summary: null,
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
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  has_cover_letter: false,
  custom_instructions: null,
} as unknown as Resume;

const initialState = {
  resume: baseResume,
  isSaving: false,
  isDeleting: false,
  hasUnsavedChanges: false,
};

// ─── UPDATE_FIELD ─────────────────────────────────────────────────────────────

describe("resumeReducer — UPDATE_FIELD", () => {
  it("updates the specified field on the resume", () => {
    const next = resumeReducer(initialState, {
      type: "UPDATE_FIELD",
      field: "first_name",
      value: "Alice",
    });
    expect(next.resume.first_name).toBe("Alice");
  });

  it("does not mutate other resume fields", () => {
    const next = resumeReducer(initialState, {
      type: "UPDATE_FIELD",
      field: "first_name",
      value: "Alice",
    });
    expect(next.resume.last_name).toBe("Doe");
    expect(next.resume.email).toBe("jane@example.com");
  });

  it("does not mutate the original state object", () => {
    resumeReducer(initialState, {
      type: "UPDATE_FIELD",
      field: "first_name",
      value: "Alice",
    });
    expect(initialState.resume.first_name).toBe("Jane");
  });

  it("preserves isSaving, isDeleting, hasUnsavedChanges", () => {
    const withFlags = {
      ...initialState,
      isSaving: true,
      isDeleting: true,
      hasUnsavedChanges: true,
    };
    const next = resumeReducer(withFlags, {
      type: "UPDATE_FIELD",
      field: "name",
      value: "Updated",
    });
    expect(next.isSaving).toBe(true);
    expect(next.isDeleting).toBe(true);
    expect(next.hasUnsavedChanges).toBe(true);
  });

  it("can update array fields", () => {
    const exp = [
      {
        company: "Acme",
        position: "Eng",
        date: "",
        location: "",
        description: [],
        technologies: [],
      },
    ];
    const next = resumeReducer(initialState, {
      type: "UPDATE_FIELD",
      field: "work_experience",
      value: exp,
    });
    expect(next.resume.work_experience).toHaveLength(1);
    expect(next.resume.work_experience[0].company).toBe("Acme");
  });
});

// ─── SET_RESUME ───────────────────────────────────────────────────────────────

describe("resumeReducer — SET_RESUME", () => {
  it("replaces the entire resume", () => {
    const newResume = { ...baseResume, name: "Brand New Resume" } as Resume;
    const next = resumeReducer(initialState, {
      type: "SET_RESUME",
      value: newResume,
    });
    expect(next.resume.name).toBe("Brand New Resume");
  });

  it("resets hasUnsavedChanges to false", () => {
    const dirty = { ...initialState, hasUnsavedChanges: true };
    const next = resumeReducer(dirty, {
      type: "SET_RESUME",
      value: baseResume,
    });
    expect(next.hasUnsavedChanges).toBe(false);
  });

  it("preserves isSaving and isDeleting flags", () => {
    const state = { ...initialState, isSaving: true, isDeleting: true };
    const next = resumeReducer(state, {
      type: "SET_RESUME",
      value: baseResume,
    });
    expect(next.isSaving).toBe(true);
    expect(next.isDeleting).toBe(true);
  });
});

// ─── SET_SAVING ───────────────────────────────────────────────────────────────

describe("resumeReducer — SET_SAVING", () => {
  it("sets isSaving to true", () => {
    const next = resumeReducer(initialState, {
      type: "SET_SAVING",
      value: true,
    });
    expect(next.isSaving).toBe(true);
  });

  it("sets isSaving back to false", () => {
    const saving = { ...initialState, isSaving: true };
    const next = resumeReducer(saving, { type: "SET_SAVING", value: false });
    expect(next.isSaving).toBe(false);
  });

  it("does not touch resume or other flags", () => {
    const next = resumeReducer(initialState, {
      type: "SET_SAVING",
      value: true,
    });
    expect(next.resume).toBe(initialState.resume);
    expect(next.isDeleting).toBe(false);
    expect(next.hasUnsavedChanges).toBe(false);
  });
});

// ─── SET_DELETING ─────────────────────────────────────────────────────────────

describe("resumeReducer — SET_DELETING", () => {
  it("sets isDeleting to true", () => {
    const next = resumeReducer(initialState, {
      type: "SET_DELETING",
      value: true,
    });
    expect(next.isDeleting).toBe(true);
  });

  it("sets isDeleting back to false", () => {
    const deleting = { ...initialState, isDeleting: true };
    const next = resumeReducer(deleting, {
      type: "SET_DELETING",
      value: false,
    });
    expect(next.isDeleting).toBe(false);
  });

  it("does not touch resume or other flags", () => {
    const next = resumeReducer(initialState, {
      type: "SET_DELETING",
      value: true,
    });
    expect(next.resume).toBe(initialState.resume);
    expect(next.isSaving).toBe(false);
  });
});

// ─── SET_HAS_CHANGES ─────────────────────────────────────────────────────────

describe("resumeReducer — SET_HAS_CHANGES", () => {
  it("marks resume as having unsaved changes", () => {
    const next = resumeReducer(initialState, {
      type: "SET_HAS_CHANGES",
      value: true,
    });
    expect(next.hasUnsavedChanges).toBe(true);
  });

  it("clears unsaved changes flag", () => {
    const dirty = { ...initialState, hasUnsavedChanges: true };
    const next = resumeReducer(dirty, {
      type: "SET_HAS_CHANGES",
      value: false,
    });
    expect(next.hasUnsavedChanges).toBe(false);
  });

  it("does not touch resume, isSaving, or isDeleting", () => {
    const next = resumeReducer(initialState, {
      type: "SET_HAS_CHANGES",
      value: true,
    });
    expect(next.resume).toBe(initialState.resume);
    expect(next.isSaving).toBe(false);
    expect(next.isDeleting).toBe(false);
  });
});
