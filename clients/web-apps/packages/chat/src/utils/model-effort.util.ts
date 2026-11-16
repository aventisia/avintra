/** How long a reasoning model thinks before it answers. */
export type ChatEffort = "low" | "medium" | "high";

const OPENAI_REASONING = /^(o\d|gpt-5)/;

/** Whether the pipeline passes an effort level to this model; only OpenAI reasoning models take one today. */
export const modelSupportsEffort = (provider: string, modelId: string) => {
  const id = modelId.toLowerCase();
  return provider === "openai" && OPENAI_REASONING.test(id) && !id.includes("chat");
};
