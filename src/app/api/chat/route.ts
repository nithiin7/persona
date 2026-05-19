import { LanguageModelV1, ToolInvocation, smoothStream, streamText } from "ai";
import { Resume, Job } from "@/lib/types";
import { initializeAIClient, type AIConfig } from "@/utils/ai-tools";
import { tools } from "@/lib/tools";

interface Message {
  role: "user" | "assistant";
  content: string;
  toolInvocations?: ToolInvocation[];
}

interface ChatRequest {
  messages: Message[];
  resume: Resume;
  target_role: string;
  config?: AIConfig;
  job?: Job;
}

export async function POST(req: Request) {
  try {
    const requestBody = await req.json();

    const { messages, target_role, config, job, resume }: ChatRequest =
      requestBody;

    const isPro = true;

    // Initialize the AI client using the provided config and plan.
    const aiClient = initializeAIClient(config, isPro);

    const isOllamaModel = config?.model?.startsWith("ollama::");

    // Build and send the AI call.
    const result = streamText({
      model: aiClient as LanguageModelV1,
      system: isOllamaModel
        ? `You are Persona, an expert technical resume consultant specializing in computer science and software engineering careers. Your expertise spans resume optimization, technical writing, and industry best practices for tech job applications.

      The target role is ${target_role}. The job is ${job ? JSON.stringify(job) : "No job specified"}.
      Current resume: ${resume ? `${resume.first_name} ${resume.last_name} - ${resume.target_role}` : "No resume data"}.
      Professional summary: ${resume?.professional_summary ? `"${resume.professional_summary}"` : "None set yet."}.
      Work experience: ${JSON.stringify(resume?.work_experience ?? [])}.
      Skills: ${JSON.stringify(resume?.skills ?? [])}.
      Projects: ${JSON.stringify(resume?.projects ?? [])}.
      Education: ${JSON.stringify(resume?.education ?? [])}.

      Provide clear, actionable resume advice in plain text. When suggesting edits, write out the improved content directly so the user can copy it.`
        : `
      You are Persona, an expert technical resume consultant
      specializing in computer science and software
      engineering careers. Your expertise spans resume
      optimization, technical writing, and industry best
      practices for tech job applications.

      TOOL USAGE INSTRUCTIONS:
      1. For professional summary improvements:
         - Use 'suggest_professional_summary' with 'improved_summary' field
         - Write 2-4 sentences tailored to the target role and job description

      2. For work experience improvements:
         - Use 'suggest_work_experience_improvement' with 'index' and 'improved_experience' fields
         - Always include company, position, date, and description

      3. For project improvements:
         - Use 'suggest_project_improvement' with 'index' and 'improved_project' fields
         - Always include name and description

      4. For skill improvements:
         - Use 'suggest_skill_improvement' with 'index' and 'improved_skill' fields
         - Only use for adding new or removing existing skills

      5. For education improvements:
         - Use 'suggest_education_improvement' with 'index' and 'improved_education' fields
         - Always include school, degree, field, and date

      6. For certifications:
         - Use 'suggest_certification' with 'index' and 'improved_certification' fields
         - For a new certification use index -1
         - Always include name and provider

      7. For viewing resume sections:
         - Use 'getResume' with 'sections' array
         - Valid sections: 'all', 'personal_info', 'work_experience', 'education', 'skills', 'projects', 'certifications'

      8. For multiple section updates:
         - Use 'modifyWholeResume' when changing multiple sections at once

      CRITICAL RULES — always follow these:
      - When asked to rate, score, review, or analyze the resume: ALWAYS call getResume(['all']) first. Never ask the user to provide their resume content.
      - When modifying skills: ALWAYS call getResume(['skills']) first. Find the exact index of the matching category. Include ALL existing items plus the new one — never drop existing skills. Capitalize the first letter of each skill item.
      - When adding a certification: ALWAYS call getResume(['certifications']) first to check existing certs and their indices. Use suggest_certification with index -1 for a brand new cert. NEVER put certifications in the education section.
      - When modifying any section by index: call getResume first to confirm the correct index.

      Aim to use a maximum of 5 tools in one go, then confirm with the user if they would like you to continue.
      The target role is ${target_role}.
      Current resume: ${resume ? `${resume.first_name} ${resume.last_name} — ${resume.target_role}` : "No resume data"}.
      Professional summary: ${resume?.professional_summary ? `"${resume.professional_summary}"` : "None set yet."}.

      ${
        job
          ? `JOB CONTEXT — This resume is being tailored to a specific role. Every suggestion you make MUST be optimized for this job.

      Target company: ${job.company_name || "N/A"}
      Target position: ${job.position_title || target_role}
      ${job.keywords && job.keywords.length > 0 ? `Known JD keywords (inject naturally where truthful): ${job.keywords.join(", ")}` : ""}
      ${job.description ? `Full job description:\n${job.description}` : ""}

      JOB-AWARE RULES:
      - When rewriting bullets, inject exact JD keywords (same spelling/capitalization) where they truthfully apply
      - When suggesting skills, prioritize skills mentioned in the job description
      - When reordering sections, put the most JD-relevant content first
      - Bold JD keywords in bullet points using **keyword** syntax
      - Never fabricate experience — only inject keywords consistent with what the candidate demonstrably did`
          : "No specific job targeted — provide general resume best-practice advice."
      }
      `,
      messages,
      maxSteps: isOllamaModel ? 1 : 5,
      tools: isOllamaModel ? undefined : tools,
      experimental_transform: smoothStream({
        delayInMs: 20,
        chunking: "word",
      }),
    });

    return result.toDataStreamResponse({
      sendUsage: false,
      getErrorMessage: (error) => {
        if (!error) return "Unknown error occurred";
        if (error instanceof Error) return error.message;
        return JSON.stringify(error);
      },
    });
  } catch (error) {
    console.error("Error in chat route:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
