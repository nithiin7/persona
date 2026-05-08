"use server";

import { generateObject, LanguageModelV1 } from "ai";
import { z } from "zod";
import {
  simplifiedJobSchema,
  simplifiedResumeSchema,
  workExperienceSchema,
  educationSchema,
  skillSchema,
  projectSchema,
  certificationSchema,
} from "@/lib/zod-schemas";
import { Job, Resume } from "@/lib/types";
import { AIConfig } from "@/utils/ai-tools";
import { initializeAIClient } from "@/utils/ai-tools";

// Some models return description as a structured object instead of a string.
const jobAISchema = simplifiedJobSchema.extend({
  description: z.preprocess((val) => {
    if (val && typeof val === "object") {
      const obj = val as Record<string, unknown>;
      const bullets = Array.isArray(obj.bullet_points)
        ? (obj.bullet_points as string[]).map((b) => `• ${b}`).join("\n")
        : "";
      const paragraph = typeof obj.paragraph === "string" ? obj.paragraph : "";
      return [bullets, paragraph].filter(Boolean).join("\n\n");
    }
    return val;
  }, z.string().nullable().optional()),
});

// Preprocessor helpers that normalize field name variations across models.
function normalizeWorkExp(item: unknown) {
  if (typeof item !== "object" || !item) return item;
  const i = item as Record<string, unknown>;
  return {
    company: i.company,
    position: i.position ?? i.role ?? i.title,
    location: i.location,
    date: i.date ?? i.dates,
    description: Array.isArray(i.description)
      ? i.description
      : Array.isArray(i.responsibilities)
        ? i.responsibilities
        : typeof i.description === "string"
          ? [i.description]
          : undefined,
    technologies: Array.isArray(i.technologies) ? i.technologies : undefined,
  };
}

function normalizeEducation(item: unknown) {
  if (typeof item !== "object" || !item) return item;
  const i = item as Record<string, unknown>;
  return {
    school: i.school ?? i.institution ?? i.university,
    degree: i.degree,
    field: i.field ?? i.major,
    location: i.location,
    date: i.date ?? i.dates,
    gpa: i.gpa,
    achievements: Array.isArray(i.achievements) ? i.achievements : undefined,
  };
}

function normalizeProject(item: unknown) {
  if (typeof item !== "object" || !item) return item;
  const i = item as Record<string, unknown>;
  return {
    name: i.name ?? i.title,
    description: Array.isArray(i.description)
      ? i.description
      : typeof i.description === "string"
        ? [i.description]
        : undefined,
    date: i.date ?? i.dates,
    technologies: Array.isArray(i.technologies) ? i.technologies : undefined,
    url: i.url,
    github_url: i.github_url,
  };
}

function normalizeSkills(val: unknown) {
  if (!Array.isArray(val)) return val;
  // Already [{category, items}] format
  if (
    val.length > 0 &&
    typeof val[0] === "object" &&
    val[0] !== null &&
    "items" in (val[0] as object)
  ) {
    return val;
  }
  // Flat string array — group under one category
  if (val.every((v) => typeof v === "string")) {
    return [{ category: "Skills", items: val }];
  }
  return val;
}

// Schema that tolerates the field name variations Ollama and other smaller
// models tend to produce instead of strictly following the schema field names.
const resumeAISchema = z.object({
  work_experience: z
    .array(z.preprocess(normalizeWorkExp, workExperienceSchema))
    .optional(),
  education: z
    .array(z.preprocess(normalizeEducation, educationSchema))
    .optional(),
  skills: z.preprocess(normalizeSkills, z.array(skillSchema).optional()),
  projects: z.array(z.preprocess(normalizeProject, projectSchema)).optional(),
  certifications: z.array(certificationSchema).optional(),
  // Models often omit this — we fill it in from the job listing after parsing.
  target_role: z.string().optional().default(""),
});

export async function tailorResumeToJob(
  resume: Resume,
  jobListing: z.infer<typeof simplifiedJobSchema>,
  config?: AIConfig
) {
  const isPro = true;
  const aiClient = initializeAIClient(config, isPro, true);

  try {
    const { object } = await generateObject({
      model: aiClient as LanguageModelV1,
      temperature: 0.5,
      schema: resumeAISchema,
      maxRetries: 2,
      system: `
You are Persona, an advanced AI resume transformer that specializes in optimizing technical resumes for software engineering roles using machine-learning-driven ATS strategies. Your mission is to transform the provided resume into a highly targeted, ATS-friendly document that precisely aligns with the job description.

**Core Objectives:**

1. **Integrate Job-Specific Terminology & Reorder Content:**
   - Replace generic descriptions with precise, job-specific technical terms drawn from the job description.
   - Reorder or emphasize sections and bullet points to prioritize experiences that most closely match the role's requirements.
   - Use strong, active language that mirrors the job description's vocabulary and focus.
   - Ensure all modifications are strictly based on the resume's original data—never invent new tools, versions, or experiences.

2. **STAR Framework for Technical Storytelling:**
   For every work experience bullet point:
   - Situation: briefly set the technical or business context.
   - Task: define the specific responsibility or challenge.
   - Action: describe the technical actions taken with specific technology stack details.
   - Result: quantify the impact with clear, job-relevant metrics.

3. **Enhanced Technical Detailing:**
   - Convert simple technology lists into detailed representations including versions and frameworks.
   - Enrich work experience with architectural context and measurable performance metrics.

4. **Strict Output Schema:**
   Return ONLY these fields with EXACTLY these names:
   - work_experience: array of { company, position, location, date, description (array of strings), technologies (array of strings) }
   - education: array of { school, degree, field, location, date, gpa, achievements (array of strings) }
   - skills: array of { category (string), items (array of strings) }
   - projects: array of { name, description (array of strings), date, technologies (array of strings), url, github_url }
   - certifications: array of { name, provider, date, credential_id, credential_url }
   - target_role: string (the job position title)

   Do NOT use field names like "role", "dates", "responsibilities", "institution", "title" — use the exact names above.
      `,
      prompt: `
    This is the Resume:
    ${JSON.stringify(resume, null, 2)}

    This is the Job Description:
    ${JSON.stringify(jobListing, null, 2)}
    `,
    });

    // Ensure target_role is always set
    const result: z.infer<typeof simplifiedResumeSchema> = {
      ...object,
      target_role: object.target_role || jobListing.position_title || "",
    };

    return result;
  } catch (error) {
    console.error("Error tailoring resume:", error);
    throw error;
  }
}

export async function formatJobListing(jobListing: string, config?: AIConfig) {
  const isPro = true;
  const aiClient = initializeAIClient(config, isPro, true);

  try {
    const { object } = await generateObject({
      model: aiClient as LanguageModelV1,
      temperature: 0.7,
      schema: jobAISchema,
      system: `You are an AI assistant specializing in structured data extraction from job listings. You have been provided with a schema
              and must adhere to it strictly. When processing the given job listing, follow these steps:
              IMPORTANT: For any missing or uncertain information, you must return an empty string ("") - never return "<UNKNOWN>" or similar placeholders.

            Read the entire job listing thoroughly to understand context, responsibilities, requirements, and any other relevant details.
            Perform the analysis as described in each TASK below.
            Return your final output in a structured format (e.g., JSON or the prescribed schema), using the exact field names you have been given.
            Do not guess or fabricate information that is not present in the listing; instead, return an empty string for missing fields.
            Do not include chain-of-thought or intermediate reasoning in the final output; provide only the structured results.

            For the description field, return a plain string:
            - Start with 3-5 bullet points (each on a new line starting with "• ") highlighting the most important responsibilities.
            - Follow with a clean paragraph summarizing the full job description.
            - Do NOT return description as a JSON object or nested structure — it must be a single string.`,
      prompt: `Analyze this job listing carefully and extract structured information.

              TASK 1 - ESSENTIAL INFORMATION:
              Extract the basic details (company, position, URL, location, salary).
              For the description, include 3-5 key responsibilities as bullet points followed by a summary paragraph — all as a single string.

              TASK 2 - KEYWORD ANALYSIS:
              1. Technical Skills: Identify all technical skills, programming languages, frameworks, and tools
              2. Soft Skills: Extract interpersonal and professional competencies
              3. Industry Knowledge: Capture domain-specific knowledge requirements
              4. Required Qualifications: List education, and experience levels
              5. Responsibilities: Key job functions and deliverables

              Format the output according to the schema, ensuring:
              - Keywords as they are (e.g., "React.js" → "React.js")
              - Skills are deduplicated and categorized
              - Seniority level is inferred from context
              - description is a plain string (NOT a JSON object)

              Usage Notes:
              - If certain details (like salary or location) are missing, return "" (an empty string).
              - Adhere to the schema you have been provided, and format your response accordingly.
              - Avoid exposing your internal reasoning.
              - DO NOT RETURN "<UNKNOWN>", if you are unsure of a piece of data, return an empty string.
              - FORMAT THE FOLLOWING JOB LISTING AS A JSON OBJECT: ${jobListing}`,
    });

    return object satisfies Partial<Job>;
  } catch (error) {
    console.error("Error formatting job listing:", error);
    throw error;
  }
}
