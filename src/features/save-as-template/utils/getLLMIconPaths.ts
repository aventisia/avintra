import { LLMsEnum, LLMsEnumForProduction } from "@/enums/llms-enum";

// Mapping of LLMs to icon paths
type AllLLMKeys = keyof typeof LLMsEnum | keyof typeof LLMsEnumForProduction;

const LLMIconPaths: Record<AllLLMKeys, string> = {
  "deepseek-r1": "brand-img/deepseek.svg",
  phi4: "brand-img/phi.svg",
  "llama3.1": "brand-img/llama.svg",
  "llama3.2": "brand-img/llama.svg",
  mistral: "brand-img/mistral.svg",
  gemma: "brand-img/gemma.svg",
  "gpt-4o-mini": "brand-img/openai.svg",
  "gpt-4o": "brand-img/openai.svg",
};

// Function to get unique icon paths based on LLM input
export function getLLMIconPaths(llms: string[]): string[] {
  // Convert the input strings to enum values
  const uniqueLLMs = Array.from(new Set(llms)); // Remove duplicates from the input

  // Map each LLM to its corresponding icon path
  return uniqueLLMs
    .map((llm) => LLMIconPaths[llm as AllLLMKeys] || null)
    .filter(Boolean) as string[];
}
