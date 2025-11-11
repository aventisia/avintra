import { LLMsEnum } from "@/enums/llms-enum";

// Mapping of LLMs to icon paths
const LLMIconPaths: Record<LLMsEnum, string> = {
  [LLMsEnum["deepseek-r1"]]: "brand-img/deepseek.svg",
  [LLMsEnum.phi4]: "brand-img/phi.svg",
  [LLMsEnum["llama3.1"]]: "brand-img/llama.svg",
  [LLMsEnum["llama3.2"]]: "brand-img/llama.svg",
  [LLMsEnum.mistral]: "brand-img/mistral.svg",
  [LLMsEnum.gemma]: "brand-img/gemma.svg",
  [LLMsEnum["gpt-4o-mini"]]: "brand-img/openai.svg",
};

// Function to get unique icon paths based on LLM input
export function getLLMIconPaths(llms: string[]): string[] {
  // Convert the input strings to enum values
  const uniqueLLMs = Array.from(new Set(llms)); // Remove duplicates from the input

  // Map each LLM to its corresponding icon path
  const iconPaths = uniqueLLMs
    .map((llm) => {
      if (LLMsEnum[llm as keyof typeof LLMsEnum]) {
        return LLMIconPaths[LLMsEnum[llm as keyof typeof LLMsEnum]];
      }
      return null; // In case an invalid LLM is passed
    })
    .filter(Boolean) as string[]; // Remove any null values

  return iconPaths;
}
