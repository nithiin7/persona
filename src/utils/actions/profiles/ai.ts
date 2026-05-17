"use server";
import { generateObject, LanguageModelV1 } from "ai";
import { z } from "zod";
import { RESUME_FORMATTER_SYSTEM_MESSAGE } from "@/lib/prompts";
import { initializeAIClient, type AIConfig } from "@/utils/ai-tools";
import { sanitizeUnknownStrings } from "@/lib/utils";

export async function fetchLinkedInProfileText(url: string): Promise<string> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Invalid URL");
  }
  if (!parsed.hostname.includes("linkedin.com")) {
    throw new Error("Please provide a LinkedIn URL");
  }

  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
  } catch (err) {
    // LinkedIn returns HTTP 999 for bot-blocked requests; Node fetch throws
    // a RangeError because 999 is outside the 200-599 spec range.
    if (
      err instanceof RangeError ||
      (err instanceof Error && err.message.includes("status"))
    ) {
      throw new Error(
        "LinkedIn blocked the request. Please use the manual copy-paste method: open your profile, press Ctrl+A then Ctrl+C, and paste the text below."
      );
    }
    throw err;
  }

  if (!res.ok) {
    throw new Error(
      `LinkedIn returned ${res.status}. The profile may be private or LinkedIn blocked the request.`
    );
  }

  const html = await res.text();

  // Detect login-wall redirect (LinkedIn sends this when it blocks bots)
  if (
    html.includes('id="session_key"') ||
    html.includes("/authwall") ||
    html.includes("authwall")
  ) {
    throw new Error(
      "LinkedIn requires a login to view this profile. Use the manual copy-paste method instead."
    );
  }

  // Extract JSON-LD structured data (LinkedIn includes this for SEO)
  const jsonLdBlocks: string[] = [];
  const jsonLdRe =
    /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = jsonLdRe.exec(html)) !== null) {
    jsonLdBlocks.push(m[1].trim());
  }

  // Strip tags and collapse whitespace for plain text fallback
  const plainText = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, 12000);

  if (jsonLdBlocks.length > 0) {
    return `LinkedIn JSON-LD:\n${jsonLdBlocks.join("\n")}\n\nPage text:\n${plainText}`;
  }
  return plainText;
}

// TEXT RESUME -> PROFILE
export async function formatProfileWithAI(
  userMessages: string,
  config?: AIConfig
) {
  try {
    const isPro = true;
    const aiClient = initializeAIClient(config, isPro);

    const { object } = await generateObject({
      model: aiClient as LanguageModelV1,
      schema: z.object({
        content: z.object({
          first_name: z.string().optional(),
          last_name: z.string().optional(),
          email: z.string().optional(),
          phone_number: z.string().optional(),
          location: z.string().optional(),
          website: z.string().optional(),
          linkedin_url: z.string().optional(),
          github_url: z.string().optional(),
          work_experience: z
            .array(
              z.object({
                company: z.string(),
                position: z.string(),
                date: z.string(),
                location: z.string().optional(),
                description: z.array(z.string()),
                technologies: z.array(z.string()).optional(),
              })
            )
            .optional(),
          education: z
            .array(
              z.object({
                school: z.string(),
                degree: z.string(),
                field: z.string(),
                date: z.string(),
                location: z.string().optional(),
                gpa: z.string().optional(),
                achievements: z.array(z.string()).optional(),
              })
            )
            .optional(),
          skills: z
            .array(
              z.object({
                category: z.string(),
                items: z.array(z.string()),
              })
            )
            .optional(),
          projects: z
            .array(
              z.object({
                name: z.string(),
                description: z.array(z.string()),
                technologies: z.array(z.string()).optional(),
                date: z.string().optional(),
                url: z.string().optional(),
                github_url: z.string().optional(),
              })
            )
            .optional(),
          certifications: z
            .array(
              z.object({
                name: z.string(),
                provider: z.string(),
                date: z.string().optional(),
                credential_id: z.string().optional(),
                credential_url: z.string().optional(),
              })
            )
            .optional(),
        }),
      }),
      prompt: `Please analyze this resume text and extract all relevant information into a structured profile format. 
                Include all sections (personal info, work experience, education, skills, projects, certifications) if present.
                Ensure all arrays (like description, technologies, achievements) are properly formatted as arrays.
                For any missing or unclear information, use optional fields rather than making assumptions.
  
                Resume Text:
  ${userMessages}`,
      system: RESUME_FORMATTER_SYSTEM_MESSAGE.content as string,
    });

    return sanitizeUnknownStrings(object.content);
  } catch (error) {
    throw error;
  }
}
