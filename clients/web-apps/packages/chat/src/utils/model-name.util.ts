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
