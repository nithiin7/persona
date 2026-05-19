"use server";

import { Resume } from "@/lib/types";
import {
  textImportSchema,
  workExperienceBulletPointsSchema,
} from "@/lib/zod-schemas";
import { generateObject } from "ai";
import { z } from "zod";
import { initializeAIClient, type AIConfig } from "@/utils/ai-tools";
import { MODEL_DESIGNATIONS } from "@/lib/ai-models";
import {
  PROJECT_GENERATOR_MESSAGE,
  PROJECT_IMPROVER_MESSAGE,
  TEXT_ANALYZER_SYSTEM_MESSAGE,
  WORK_EXPERIENCE_GENERATOR_MESSAGE,
  WORK_EXPERIENCE_IMPROVER_MESSAGE,
} from "@/lib/prompts";
import {
  projectAnalysisSchema,
  workExperienceItemsSchema,
} from "@/lib/zod-schemas";
import { WorkExperience } from "@/lib/types";

// Base Resume Creation
// TEXT CONTENT -> RESUME
export async function convertTextToResume(
  prompt: string,
  existingResume: Resume,
  targetRole: string,
  config?: AIConfig
) {
  const _unusedConfig = config;

  // Use fast and cheap free model for text parsing
  const hardcodedConfig = {
    model: MODEL_DESIGNATIONS.FAST_CHEAP_FREE,
    apiKeys: [],
  };
  const aiClient = initializeAIClient(hardcodedConfig);

  const { object } = await generateObject({
    model: aiClient,
    schema: z.object({
      content: textImportSchema,
    }),
    system: `You are ResumeFormatter, an expert system specialized in analyzing complete resumes and converting them into a structured JSON object tailored for targeted job applications.

        Your task is to transform the complete resume text into a JSON object according to the provided schema. You will identify and extract the most relevant experiences, skills, projects, and educational background based on the target role. While doing so, you are allowed to make minimal formatting changes only to enhance clarity and highlight relevance—**do not reword, summarize, or alter the core details of any content.**

        CRITICAL DIRECTIVES:
        1. **Analysis & Selection:**
          - Analyze the full resume text that includes all user experiences, skills, projects, and education.
          - Identify the items that best match the target role: ${targetRole}.
          - Always include the education section:
            - If only one educational entry exists, include it.
            - If multiple entries exist, select the one(s) most relevant to the target role.

        2. **Formatting & Emphasis:**
          - Transform the resume into a JSON object following the schema, with sections such as basic information, professional experience, projects, skills, and education.
          - Preserve all original details, dates, and descriptions. Only modify the text for formatting purposes.
          - **Enhance relevance by marking keywords** within work experience descriptions, project details, achievements, and education details with bold formatting (i.e., wrap them with two asterisks like **this**). Apply this only to keywords or phrases that are highly relevant to the target role.
          - Do not add any formatting to section titles or headers.
          - Use empty arrays ([]) for any sections that do not contain relevant items.

        3. **Output Requirements:**
          - The final output must be a valid JSON object that adheres to the specified schema.
          - Include only the most relevant items, optimized for the target role.
          - Do not add any new information or rephrase the provided content—only apply minor formatting (like bolding) to emphasize key points.
        `,
    prompt: `INPUT:
    Extract and transform the resume information from the following text:
    ${prompt}
    Now, format this information into the JSON object according to the schema, ensuring it is optimized for the target role: ${targetRole}.`,
  });

  const updatedResume = {
    ...existingResume,
    ...(object.content.first_name && { first_name: object.content.first_name }),
    ...(object.content.last_name && { last_name: object.content.last_name }),
    ...(object.content.email && { email: object.content.email }),
    ...(object.content.phone_number && {
      phone_number: object.content.phone_number,
    }),
    ...(object.content.location && { location: object.content.location }),
    ...(object.content.website && { website: object.content.website }),
    ...(object.content.linkedin_url && {
      linkedin_url: object.content.linkedin_url,
    }),
    ...(object.content.github_url && { github_url: object.content.github_url }),

    work_experience: [
      ...existingResume.work_experience,
      ...(object.content.work_experience || []),
    ],
    education: [
      ...existingResume.education,
      ...(object.content.education || []),
    ],
    skills: [...existingResume.skills, ...(object.content.skills || [])],
    projects: [...existingResume.projects, ...(object.content.projects || [])],
  };

  return updatedResume;
}

// EDUCATION ACHIEVEMENTS GENERATION
export async function generateEducationAchievements(
  edu: { school: string; degree: string; field: string; date?: string },
  resume: Resume,
  jobDescription?: string,
  config?: AIConfig
) {
  const isPro = true;
  const aiClient = initializeAIClient(config, isPro);

  const existingSkills = resume.skills
    .flatMap((s) => s.items)
    .slice(0, 20)
    .join(", ");

  const { object } = await generateObject({
    model: aiClient,
    schema: z.object({
      achievements: z
        .array(z.string())
        .min(2)
        .max(5)
        .describe("List of achievement bullet points for the education entry"),
    }),
    prompt: `Generate 3-5 achievement bullet points for an education section of a resume.

Education:
- School: ${edu.school}
- Degree: ${edu.degree} in ${edu.field}
${edu.date ? `- Date: ${edu.date}` : ""}
${existingSkills ? `\nCandidate's Skills: ${existingSkills}` : ""}
${resume.target_role ? `Target Role: ${resume.target_role}` : ""}
${jobDescription ? `\nTarget Job Description:\n${jobDescription.slice(0, 1000)}` : ""}`,
    system: `You are an expert resume writer. Generate concise, impactful achievement bullet points for an education section. Focus on: academic honors, relevant coursework, clubs/leadership, research, or projects. Start each bullet with a strong action verb or noun. Be specific but do not fabricate GPA or awards not mentioned. Keep each bullet under 15 words.`,
  });

  return object.achievements;
}

// SKILL SUGGESTIONS
export async function suggestSkills(
  resume: Resume,
  jobDescription?: string,
  config?: AIConfig
) {
  const isPro = true;
  const aiClient = initializeAIClient(config, isPro);

  const existingCategories = resume.skills
    .map((s) => s.category)
    .filter(Boolean);
  const existingItems = resume.skills.flatMap((s) => s.items);

  const workContext = resume.work_experience
    .slice(0, 3)
    .map((w) => `${w.position} at ${w.company}`)
    .join(", ");

  const { object } = await generateObject({
    model: aiClient,
    schema: z.object({
      suggestions: z
        .array(
          z.object({
            skill: z.string().describe("The skill keyword to add"),
            category: z
              .string()
              .describe(
                "The category name — must exactly match an existing category if it fits there, or a new category name"
              ),
            isNewCategory: z
              .boolean()
              .describe(
                "true if this requires creating a new category, false if it should go into an existing one"
              ),
          })
        )
        .min(5)
        .max(20)
        .describe("Skill suggestions"),
    }),
    prompt: `Suggest relevant skills to add to this resume. Do NOT suggest skills already present.

Target Role: ${resume.target_role || "Not specified"}
${workContext ? `Work Experience: ${workContext}` : ""}
Existing Skill Categories: ${existingCategories.join(", ") || "none"}
Existing Skills: ${existingItems.join(", ") || "none"}
${jobDescription ? `\nJob Description (prioritize keywords from here):\n${jobDescription.slice(0, 1500)}` : ""}`,
    system: `You are an expert resume strategist. Suggest specific, high-value skill keywords that are missing from the resume. Map each skill to the best-fitting existing category (use the exact category name) or propose a new category name if it doesn't fit. Prefer concrete technologies, tools, methodologies, and domain terms over vague soft skills.`,
  });

  return object.suggestions;
}

// PROFESSIONAL SUMMARY GENERATION
export async function generateProfessionalSummary(
  resume: Resume,
  jobDescription?: string,
  config?: AIConfig
) {
  const isPro = true;
  const aiClient = initializeAIClient(config, isPro);

  const workExp = resume.work_experience
    .slice(0, 3)
    .map(
      (w) =>
        `${w.position} at ${w.company}${w.date ? ` (${w.date})` : ""}${w.description?.length ? ": " + w.description.slice(0, 2).join("; ") : ""}`
    )
    .join("\n");

  const education = resume.education
    .slice(0, 2)
    .map((e) => `${e.degree} from ${e.school}`)
    .join(", ");

  const skills = resume.skills
    .flatMap((s) => s.items)
    .slice(0, 15)
    .join(", ");

  const { object } = await generateObject({
    model: aiClient,
    schema: z.object({
      summary: z
        .string()
        .describe("A concise 2-4 sentence professional summary for the resume"),
    }),
    prompt: `Generate a professional summary for a resume. Keep it to 2-4 sentences, written in implied first person (no "I" or "my"). Focus on seniority, key skills, and value proposition.

Name: ${resume.first_name} ${resume.last_name}
Target Role: ${resume.target_role || "Not specified"}
${workExp ? `\nWork Experience:\n${workExp}` : ""}
${education ? `\nEducation: ${education}` : ""}
${skills ? `\nKey Skills: ${skills}` : ""}
${jobDescription ? `\nTarget Job Description (tailor the summary to match):\n${jobDescription.slice(0, 1500)}` : ""}`,
    system: `You are an expert resume writer. Write professional summaries that are concise, impactful, and tailored to the candidate's experience and target role. Never fabricate details not present in the provided information. Do not use "I" or "my". Avoid clichés like "results-driven" or "passionate".`,
  });

  return object.summary;
}
// NEW WORK EXPERIENCE BULLET POINTS
export async function generateWorkExperiencePoints(
  position: string,
  company: string,
  technologies: string[],
  targetRole: string,
  numPoints: number = 3,
  customPrompt: string = "",
  config?: AIConfig,
  jobDescription?: string
) {
  const isPro = true;
  const aiClient = initializeAIClient(config, isPro);

  const { object } = await generateObject({
    model: aiClient,
    schema: z.object({
      content: workExperienceBulletPointsSchema,
    }),
    prompt: `Position: ${position}
      Company: ${company}
      Technologies: ${technologies.join(", ")}
      Target Role: ${targetRole}
      Number of Points: ${numPoints}${customPrompt ? `\nCustom Focus: ${customPrompt}` : ""}${jobDescription ? `\n\nTarget Job Description (inject these exact keywords naturally where truthful):\n${jobDescription}` : ""}`,
    system: WORK_EXPERIENCE_GENERATOR_MESSAGE.content as string,
  });

  return object.content;
}

// WORK EXPERIENCE BULLET POINTS IMPROVEMENT
export async function improveWorkExperience(
  point: string,
  customPrompt?: string,
  config?: AIConfig
) {
  const isPro = true;
  const aiClient = initializeAIClient(config, isPro);

  const { object } = await generateObject({
    model: aiClient,

    schema: z.object({
      content: z.string().describe("The improved work experience bullet point"),
    }),
    prompt: `Please improve this work experience bullet point while maintaining its core message and truthfulness${customPrompt ? `. Additional requirements: ${customPrompt}` : ""}:\n\n"${point}"`,
    system: WORK_EXPERIENCE_IMPROVER_MESSAGE.content as string,
  });

  return object.content;
}

// PROJECT BULLET POINTS IMPROVEMENT
export async function improveProject(
  point: string,
  customPrompt?: string,
  config?: AIConfig
) {
  const isPro = true;
  const aiClient = initializeAIClient(config, isPro);

  const { object } = await generateObject({
    model: aiClient,
    schema: z.object({
      content: z.string().describe("The improved project bullet point"),
    }),
    prompt: `Please improve this project bullet point while maintaining its core message and truthfulness${customPrompt ? `. Additional requirements: ${customPrompt}` : ""}:\n\n"${point}"`,
    system: PROJECT_IMPROVER_MESSAGE.content as string,
  });

  return object.content;
}

// NEW PROJECT BULLET POINTS
export async function generateProjectPoints(
  projectName: string,
  technologies: string[],
  targetRole: string,
  numPoints: number = 3,
  customPrompt: string = "",
  config?: AIConfig,
  jobDescription?: string
) {
  const isPro = true;
  const aiClient = initializeAIClient(config, isPro);

  const { object } = await generateObject({
    model: aiClient,
    schema: z.object({
      content: projectAnalysisSchema,
    }),
    prompt: `Project Name: ${projectName}
      Technologies: ${technologies.join(", ")}
      Target Role: ${targetRole}
      Number of Points: ${numPoints}${customPrompt ? `\nCustom Focus: ${customPrompt}` : ""}${jobDescription ? `\n\nTarget Job Description (inject these exact keywords naturally where truthful):\n${jobDescription}` : ""}`,
    system: PROJECT_GENERATOR_MESSAGE.content as string,
  });

  return object.content;
}

// Text Import for profile
export async function processTextImport(text: string, config?: AIConfig) {
  const aiClient = initializeAIClient(config);

  const { object } = await generateObject({
    model: aiClient,
    schema: z.object({
      content: textImportSchema,
    }),
    prompt: text,
    system: TEXT_ANALYZER_SYSTEM_MESSAGE.content as string,
  });

  return object.content;
}

// WORK EXPERIENCE MODIFICATION
export async function modifyWorkExperience(
  experience: WorkExperience[],
  prompt: string,
  config?: AIConfig
) {
  const isPro = true;
  const aiClient = initializeAIClient(config, isPro);

  const { object } = await generateObject({
    model: aiClient,
    schema: z.object({
      content: workExperienceItemsSchema,
    }),
    prompt: `Please modify this work experience entry according to these instructions: ${prompt}\n\nCurrent work experience:\n${JSON.stringify(experience, null, 2)}`,
    system: `You are a professional resume writer. Modify the given work experience based on the user's instructions. 
          Maintain professionalism and accuracy while implementing the requested changes. 
          Keep the same company and dates, but modify other fields as requested.
          Use strong action verbs and quantifiable achievements where possible.`,
  });

  return object.content;
}

// ADDING TEXT CONTENT TO RESUME
export async function addTextToResume(
  prompt: string,
  existingResume: Resume,
  config?: AIConfig
) {
  const isPro = true;
  const aiClient = initializeAIClient(config, isPro);

  const { object } = await generateObject({
    model: aiClient,
    schema: z.object({
      content: textImportSchema,
    }),
    prompt: `Extract relevant resume information from the following text, including basic information (name, contact details, etc) and professional experience. Format them according to the schema:\n\n${prompt}`,
    system: TEXT_ANALYZER_SYSTEM_MESSAGE.content as string,
  });

  // Merge the AI-generated content with existing resume data
  const updatedResume = {
    ...existingResume,
    ...(object.content.first_name && { first_name: object.content.first_name }),
    ...(object.content.last_name && { last_name: object.content.last_name }),
    ...(object.content.email && { email: object.content.email }),
    ...(object.content.phone_number && {
      phone_number: object.content.phone_number,
    }),
    ...(object.content.location && { location: object.content.location }),
    ...(object.content.website && { website: object.content.website }),
    ...(object.content.linkedin_url && {
      linkedin_url: object.content.linkedin_url,
    }),
    ...(object.content.github_url && { github_url: object.content.github_url }),

    work_experience: [
      ...existingResume.work_experience,
      ...(object.content.work_experience || []),
    ],
    education: [
      ...existingResume.education,
      ...(object.content.education || []),
    ],
    skills: [...existingResume.skills, ...(object.content.skills || [])],
    projects: [...existingResume.projects, ...(object.content.projects || [])],
  };

  return updatedResume;
}
