"use server";

interface OllamaModel {
  name: string;
  model: string;
}

interface OllamaTagsResponse {
  models: OllamaModel[];
}

export async function fetchOllamaModels(
  baseUrl: string
): Promise<{ models: string[]; error?: string }> {
  try {
    const url = new URL("/api/tags", baseUrl).toString();
    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return { models: [], error: `Ollama returned HTTP ${res.status}` };
    }

    const data: OllamaTagsResponse = await res.json();
    const models = (data.models ?? []).map((m) => m.name);
    return { models };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to connect to Ollama";
    return { models: [], error: message };
  }
}
