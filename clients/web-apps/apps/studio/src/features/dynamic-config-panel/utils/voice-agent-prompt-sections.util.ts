/** Voice AI persona fields, in the order the system prompt composes them. */
export const VOICE_AGENT_GOAL_FIELD = "__Goal__Voice";
export const VOICE_AGENT_ROLE_FIELD = "__Role__Voice";
export const VOICE_AGENT_INSTRUCTIONS_FIELD = "__Instructions__Voice";

/** Persona field names used to locate the Voice AI persona tab. */
export const VOICE_AGENT_PERSONA_FIELD_NAMES: string[] = [
  VOICE_AGENT_GOAL_FIELD,
  VOICE_AGENT_ROLE_FIELD,
  VOICE_AGENT_INSTRUCTIONS_FIELD,
];

export type VoiceAgentPromptSections = {
  /** What the agent should achieve. */
  goal: string;
  /** Who the agent is. */
  role: string;
  /** Rules the agent must follow. */
  instructions: string;
};

const SECTION_LABELS = ["Goal", "Role", "Instructions"] as const;

const SECTION_PATTERN = /^[ \t]*(Goal|Role|Instructions)[ \t]*:[ \t]*(.*)$/gim;

/**
 * Splits a generated VoiceAgent prompt into its Goal/Role/Instructions sections.
 * Returns null when any section label is missing, so callers never write a
 * partially parsed result into the persona fields.
 */
export const splitVoiceAgentPromptSections = (text: string): VoiceAgentPromptSections | null => {
  const matches = [...text.matchAll(SECTION_PATTERN)];
  const found = new Map<string, string>();

  matches.forEach((match, index) => {
    const label = match[1];
    if (found.has(label)) return;

    const lineRemainder = match[2] ?? "";
    const contentStart = (match.index ?? 0) + match[0].length;
    const contentEnd = index + 1 < matches.length ? matches[index + 1].index : text.length;
    const body = `${lineRemainder}\n${text.slice(contentStart, contentEnd ?? text.length)}`;

    found.set(label, body.trim());
  });

  if (!SECTION_LABELS.every((label) => found.has(label))) return null;

  return {
    goal: found.get("Goal") ?? "",
    role: found.get("Role") ?? "",
    instructions: found.get("Instructions") ?? "",
  };
};

/** Concatenates the VoiceAgent persona fields into the refine payload. */
export const joinVoiceAgentPromptSections = (sections: VoiceAgentPromptSections): string =>
  SECTION_LABELS.map((label) => {
    const value = sections[label.toLowerCase() as keyof VoiceAgentPromptSections].trim();

    return value ? `${label}:\n${value}` : "";
  })
    .filter(Boolean)
    .join("\n\n");
