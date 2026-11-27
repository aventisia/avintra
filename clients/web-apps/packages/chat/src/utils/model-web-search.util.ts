import { claudeVersion } from "./model-name.util";

const OPENAI_SEARCH = /^(gpt-4o|gpt-4\.1|gpt-5|o3|o4)/;

/** Whether the provider's built-in web search can run for this model. */
export const modelSupportsWebSearch = (provider: string, modelId: string) => {
  const id = modelId.toLowerCase();
  if (provider === "anthropic") {
    const version = claudeVersion(id);
    return (
      !!version && (version.family === "fable" || version.family === "mythos" || version.major >= 4)
    );
  }
  return (
    provider === "openai" && OPENAI_SEARCH.test(id) && !id.includes("nano") && !id.includes("chat")
  );
};
