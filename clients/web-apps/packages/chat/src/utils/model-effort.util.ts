/** How long a reasoning model thinks before it answers. */
export type ChatEffort = "low" | "medium" | "high";

const OPENAI_REASONING = /^(o\d|gpt-5)/;
const CLAUDE_FAMILY_FIRST =
  /^claude-(opus|sonnet|haiku|fable|mythos)-(\d+)(?:-(\d{1,2}))?(?:-\d{8})?$/;
const CLAUDE_VERSION_FIRST =
  /^claude-(\d+)(?:\.(\d+))?-(opus|sonnet|haiku|fable|mythos)(?:-\d{8})?$/;

const claudeVersion = (id: string) => {
  const modelId = id.replace(/^anthropic\//, "");
  const familyFirst = CLAUDE_FAMILY_FIRST.exec(modelId);
  if (familyFirst) {
    return {
      family: familyFirst[1],
      major: Number(familyFirst[2]),
      minor: Number(familyFirst[3] ?? 0),
    };
  }
  const versionFirst = CLAUDE_VERSION_FIRST.exec(modelId);
  if (versionFirst) {
    return {
      family: versionFirst[3],
      major: Number(versionFirst[1]),
      minor: Number(versionFirst[2] ?? 0),
    };
  }
  return null;
};

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
