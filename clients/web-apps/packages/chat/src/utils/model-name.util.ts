const CLAUDE = /^claude-([a-z]+)-(\d+)(?:-(\d))?(?:-\d{8})?$/;
const GEMINI = /^gemini-(\d+(?:\.\d+)?)-([a-z-]+)$/;
const GPT = /^gpt-(\d[\w.]*)(?:-([a-z]+))?$/;

const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);

/** A readable name for Claude, Gemini and GPT model IDs ("claude-haiku-4-5" → "Claude Haiku 4.5"); other IDs come back unchanged. */
export const modelDisplayName = (modelId: string) => {
  const id = modelId.replace(/^gemini\//, "");
  let match: RegExpExecArray | null;
  if ((match = CLAUDE.exec(id)))
    return `Claude ${capitalize(match[1]!)} ${match[2]}${match[3] ? `.${match[3]}` : ""}`;
  if ((match = GEMINI.exec(id)))
    return `Gemini ${match[1]} ${match[2]!.split("-").map(capitalize).join(" ")}`;
  if ((match = GPT.exec(id))) return `GPT-${match[1]}${match[2] ? ` ${match[2]}` : ""}`;
  return modelId;
};

const CLAUDE_FAMILY_FIRST =
  /^claude-(opus|sonnet|haiku|fable|mythos)-(\d+)(?:-(\d{1,2}))?(?:-\d{8})?$/;
const CLAUDE_VERSION_FIRST =
  /^claude-(\d+)(?:\.(\d+))?-(opus|sonnet|haiku|fable|mythos)(?:-\d{8})?$/;

/** Family and version of a Claude model ID, or null when it is not one. */
export const claudeVersion = (id: string) => {
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
