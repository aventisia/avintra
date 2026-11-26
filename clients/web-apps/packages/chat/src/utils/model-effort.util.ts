import { claudeVersion } from "./model-name.util";

/** How long a reasoning model thinks before it answers. */
export type ChatEffort = "low" | "medium" | "high";

const OPENAI_REASONING = /^(o\d|gpt-5)/;

const claudeSupportsEffort = (id: string) => {
  const version = claudeVersion(id);
  if (!version) return false;
  const { family, major, minor } = version;
  if (family === "fable" || family === "mythos") return true;
  if (family === "haiku") return major >= 5;
  return major > 4 || (major === 4 && minor >= 6);
};

/** Whether the pipeline passes an effort level to this model: OpenAI reasoning models and Claude models that take Anthropic's effort setting. */
export const modelSupportsEffort = (provider: string, modelId: string) => {
  const id = modelId.toLowerCase();
  if (provider === "anthropic") return claudeSupportsEffort(id);
  return provider === "openai" && OPENAI_REASONING.test(id) && !id.includes("chat");
};
