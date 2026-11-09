import { VOICE_FIELDS } from "../constants/voice-builder.constant";
import type { VoiceBuilderSectionId, VoiceReadinessCheck } from "../types/voice-builder.type";

type FormValues = Record<string, unknown>;

const VARIABLE_PATTERN = /\{\{\s*([\w.-]+)\s*\}\}/g;

export const getVoiceSectionElementId = (id: VoiceBuilderSectionId) => `voice-section-${id}`;

const hasText = (value: unknown) => typeof value === "string" && value.trim().length > 0;

const readKey = (value: unknown, key: string) =>
  typeof value === "object" && value !== null ? (value as FormValues)[key] : undefined;

/** Names of the dynamic variables the agent can fill, or none while the feature is off. */
export const getDefinedVariables = (values: FormValues): string[] => {
  const variables = values[VOICE_FIELDS.variables];
  if (values[VOICE_FIELDS.variablesEnabled] !== true) return [];
  if (typeof variables !== "object" || variables === null || Array.isArray(variables)) return [];
  return Object.keys(variables);
};

/** `{{name}}` placeholders used in the persona and introduction that no variable defines. */
export const getUndefinedVariables = (values: FormValues): string[] => {
  const defined = new Set(getDefinedVariables(values));
  const text = [
    VOICE_FIELDS.goal,
    VOICE_FIELDS.role,
    VOICE_FIELDS.instructions,
    VOICE_FIELDS.introduction,
  ]
    .map((name) => values[name])
    .filter(hasText)
    .join("\n");
  const used = [...text.matchAll(VARIABLE_PATTERN)].map((match) => match[1]);
  return [...new Set(used)].filter((name) => !defined.has(name));
};

export const isPersonaEmpty = (values: FormValues) =>
  ![VOICE_FIELDS.goal, VOICE_FIELDS.role, VOICE_FIELDS.instructions].some((name) =>
    hasText(values[name]),
  );

export const getVoiceReadiness = (values: FormValues): VoiceReadinessCheck[] => [
  {
    section: "persona",
    label: "Persona",
    hint: "Add a goal or instructions.",
    isReady: hasText(values[VOICE_FIELDS.goal]) || hasText(values[VOICE_FIELDS.instructions]),
  },
  {
    section: "opening",
    label: "Opening",
    hint: "Write what the agent says first.",
    isReady:
      values[VOICE_FIELDS.firstSpeaker] !== "ai" || hasText(values[VOICE_FIELDS.introduction]),
  },
  {
    section: "brain",
    label: "Brain",
    hint: "Pick a language model, speech-to-text and text-to-speech models, and a voice.",
    isReady:
      hasText(readKey(values[VOICE_FIELDS.languageModel], "model")) &&
      hasText(readKey(values[VOICE_FIELDS.speechToText], "model")) &&
      hasText(readKey(values[VOICE_FIELDS.textToSpeech], "model")) &&
      hasText(readKey(values[VOICE_FIELDS.voiceConfig], "voice")),
  },
];
