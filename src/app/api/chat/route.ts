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
      1. For work experience improvements:
         - Use 'suggest_work_experience_improvement' with 'index' and 'improved_experience' fields
         - Always include company, position, date, and description

      2. For project improvements:
         - Use 'suggest_project_improvement' with 'index' and 'improved_project' fields
         - Always include name and description

      3. For skill improvements:
         - Use 'suggest_skill_improvement' with 'index' and 'improved_skill' fields
         - Only use for adding new or removing existing skills

      4. For education improvements:
         - Use 'suggest_education_improvement' with 'index' and 'improved_education' fields
         - Always include school, degree, field, and date

      5. For viewing resume sections:
         - Use 'getResume' with 'sections' array
         - Valid sections: 'all', 'personal_info', 'work_experience', 'education', 'skills', 'projects'

      6. For multiple section updates:
         - Use 'modifyWholeResume' when changing multiple sections at once

      Aim to use a maximum of 5 tools in one go, then confirm with the user if they would like you to continue.
      The target role is ${target_role}.
      Current resume summary: ${resume ? `${resume.first_name} ${resume.last_name} - ${resume.target_role}` : "No resume data"}.

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
