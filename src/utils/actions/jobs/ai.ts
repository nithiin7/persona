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
import { Job, Profile, Resume } from "@/lib/types";
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
  professional_summary: z.string().optional(),
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
  config?: AIConfig,
  profile?: Profile,
  additionalContext?: string
) {
  const isPro = true;
  const aiClient = initializeAIClient(config, isPro, true);

  const profileSection = profile
    ? `
This is the candidate's FULL CAREER PROFILE — every job, project, skill, and certification they have ever worked with. Use this as your primary source of raw material when selecting content.

Full Career Profile:
${JSON.stringify(
  {
    work_experience: profile.work_experience,
    education: profile.education,
    skills: profile.skills,
    projects: profile.projects,
    certifications: profile.certifications,
  },
  null,
  2
)}
`
    : "";

  try {
    const { object } = await generateObject({
      model: aiClient as LanguageModelV1,
      temperature: 0.2,
      schema: resumeAISchema,
      maxRetries: 2,
      system: `
You are an expert ATS optimization specialist and technical resume writer. Your task is to build the strongest possible resume for a specific job posting by selecting the best content from the candidate's career history and optimizing it for ATS scoring.

ATS systems score resumes by: (1) exact keyword matching using the same spelling and capitalization as the JD, (2) keyword frequency across the document, (3) skills section match rate, (4) job title alignment, and (5) relevant experience density. Every decision you make must optimize for these five factors.

---

**STEP 1 — EXTRACT JD KEYWORDS (do this mentally before writing anything)**

From the job description, identify:
- Top 15–20 technical skills, tools, frameworks, and languages — note their EXACT spelling and capitalization as written in the JD (e.g., "Node.js" not "NodeJS", "CI/CD" not "ci-cd", "TypeScript" not "Typescript")
- Key methodologies, architectures, and domain terms (e.g., "microservices", "REST APIs", "agile")
- The exact job position title
- Required soft-skill keywords (e.g., "cross-functional", "stakeholder", "ownership")

---

**STEP 2 — SELECT THE BEST CONTENT FROM THE FULL CAREER PROFILE**

${
  profile
    ? `A full career profile has been provided alongside the base resume. The profile is your PRIMARY source of material — it contains everything the candidate has ever done.

Selection rules:
- Work experience: include ALL jobs (never fabricate or drop companies/dates), but for each job select only the bullet points most relevant to this role; drop bullets with zero relevance as long as at least 2 remain per entry
- Projects: select up to 5 projects from the full profile list that best match the JD's tech stack and domain; if the base resume already has relevant projects, prefer those but supplement from the profile if better ones exist
- Skills: pull ALL skill items from the profile that are relevant to this role — the profile is the complete inventory; do not limit yourself to what is in the base resume
- Certifications: include any from the profile that are relevant to this role`
    : `No separate profile was provided. Use the base resume as both the source of content and formatting reference.

For each work experience entry, keep only bullet points relevant to this role (minimum 2 per entry). Use keyword gap analysis to identify what's missing.`
}

---

**STEP 3 — INCORPORATE ADDITIONAL CONTEXT (only applies when additional context is provided in the prompt)**

If the candidate provided additional context, treat it as an authoritative supplement to their profile. Before proceeding:
- Identify skills, tools, or technologies mentioned → add each as an item inside the most relevant EXISTING skill category (never create a new category for this)
- Identify experience, achievements, or domain knowledge mentioned → plan to weave into the relevant work experience bullet points or the professional summary
- Do NOT surface context as a standalone section or new category — it must be integrated into existing sections

---

**STEP 4 — KEYWORD GAP ANALYSIS**

Compare extracted JD keywords against the selected content (including additional context). For each JD keyword that is absent but plausibly within the candidate's actual experience (implied by their existing bullets, technologies, or additional context), plan to inject it naturally. Never fabricate experience — only inject terms consistent with what the candidate demonstrably did.

---

**STEP 5 — SKILLS SECTION REORDERING & ENRICHMENT**

- Reorganize skill categories so the category with the most JD-matching skills appears first.
- Within each category, move JD-matching skills to the front of the items list.
- Add any JD-required skills evidenced in the candidate's work experience or projects but not yet listed in skills.
- Use the EXACT capitalization and spelling the JD uses for all skill items.
- Remove or demote skills with zero relevance to this role to improve keyword density ratio.

---

**STEP 6 — BULLET POINT REWRITING WITH KEYWORD INJECTION**

For EVERY selected work experience and project bullet point:
- Rewrite using the STAR pattern in a single concise sentence: [Action verb] + [what was built/done with specific technology] + [business or technical context] + [quantified or concrete result]
- Inject JD keywords naturally — if the JD says "distributed systems" and the candidate built services across nodes, use "distributed systems"
- Use the EXACT spelling and capitalization of tools as they appear in the JD
- Reorder each job's bullets so the most JD-relevant ones lead
- NEVER copy original bullet points verbatim — every bullet must be meaningfully rewritten
- NEVER fabricate metrics, companies, dates, project names, or technologies not present in the source material

---

**STEP 7 — TECHNOLOGIES ARRAYS**

For each work_experience and project entry, update the technologies array to:
- Include all JD keywords consistent with what was done in that role or project (using exact JD spelling)
- Remove technologies completely irrelevant to the target role to improve signal-to-noise ratio

---

**STEP 8 — PROFESSIONAL SUMMARY**

Write a 2–4 sentence professional summary tailored to this specific role:
- Open with the candidate's title/years of experience and the target role
- Highlight the 2–3 most relevant technical strengths using exact JD keyword spelling
- If additional context was provided by the candidate, weave in those details naturally (e.g., domain knowledge, career goals, unique strengths not visible in the resume)
- Close with a concrete value statement (what they bring to the team)
- Do NOT use first-person pronouns; write in third-person implicit style (e.g., "Experienced engineer…")

---

**HARD CONSTRAINTS:**
- NEVER return an empty array for a section that has data in the input
- NEVER change company names, job titles held, school names, degree names, project names, or dates
- Always include all education entries
- Set target_role to the EXACT job position title from the job description
- Return ONLY these field names: professional_summary, work_experience, education, skills, projects, certifications, target_role
- professional_summary: string (2–4 sentences, no first-person pronouns)
- work_experience items: { company, position, location, date, description (string[]), technologies (string[]) }
- education items: { school, degree, field, location, date, gpa, achievements (string[]) }
- skills items: { category (string), items (string[]) }
- projects items: { name, description (string[]), date, technologies (string[]), url, github_url }
- certifications items: { name, provider, date, credential_id, credential_url }
      `,
      prompt: `
    ${profileSection}
    This is the Base Resume (use for formatting reference and as a fallback source):
    ${JSON.stringify(resume, null, 2)}

    This is the Job Description:
    ${JSON.stringify(jobListing, null, 2)}
    ${additionalContext ? `\nAdditional context from the candidate:\n${additionalContext}\n\nHow to use this context (follow all rules strictly):\n- NEVER create a new skill category for context-derived content\n- Skills mentioned: add them as individual items inside the most relevant EXISTING skill category (e.g., add "Python" to an existing "Languages and Frameworks" category, not a new one)\n- Experience or achievements mentioned: rewrite or supplement the most relevant work experience bullet points to incorporate them naturally — do not fabricate new jobs or dates\n- Any detail relevant to the target role: weave it into the professional_summary\n- Ignore anything irrelevant to the job description` : ""}
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

              TASK 2 - KEYWORD EXTRACTION (CRITICAL — the 'keywords' array must be populated):
              Extract ALL of the following as individual strings in the keywords array, preserving exact spelling and capitalization from the job listing:
              1. Every programming language mentioned (e.g., "Python", "TypeScript", "Go")
              2. Every framework, library, or tool mentioned (e.g., "React", "Node.js", "PostgreSQL", "Docker")
              3. Every platform or cloud service mentioned (e.g., "AWS", "GCP", "Kubernetes")
              4. Key methodologies or architectures (e.g., "microservices", "REST API", "CI/CD", "agile")
              5. Domain-specific terms that appear in requirements (e.g., "distributed systems", "machine learning")
              6. Required soft-skill phrases used verbatim (e.g., "cross-functional", "stakeholder management")
              The keywords array MUST contain at least 10 items if the job listing has technical requirements. Never return an empty keywords array for a technical role.

              Format the output according to the schema, ensuring:
              - Keywords preserve exact casing from the listing (e.g., "React.js" not "react.js", "TypeScript" not "typescript")
              - Keywords are deduplicated (no duplicates)
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
