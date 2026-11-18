import { VOICE_FIELDS } from "../constants/voice-builder.constant";
import type {
  VoiceEngineStepId,
  VoicePromptStageId,
  VoiceReadinessCheck,
  VoiceStageMark,
} from "../types/voice-builder.type";

type FormValues = Record<string, unknown>;

const VARIABLE_PATTERN = /\{\{\s*([\w.-]+)\s*\}\}/g;

const hasText = (value: unknown) => typeof value === "string" && value.trim().length > 0;

const readKey = (value: unknown, key: string) =>
  typeof value === "object" && value !== null ? (value as FormValues)[key] : undefined;

/** Names of the dynamic variables the agent can fill. */
export const getDefinedVariables = (values: FormValues): string[] => {
  const variables = values[VOICE_FIELDS.variables];
  if (typeof variables !== "object" || variables === null || Array.isArray(variables)) return [];
  return Object.keys(variables);
};

const getPlaceholders = (values: FormValues, fields: string[]): string[] => {
  const text = fields
    .map((name) => values[name])
    .filter(hasText)
    .join("\n");
  return [...new Set([...text.matchAll(VARIABLE_PATTERN)].map((match) => match[1]))];
};

/** Distinct `{{name}}` placeholders used in the persona, instructions, and introduction. */
export const getUsedVariables = (values: FormValues): string[] =>
  getPlaceholders(values, [
    VOICE_FIELDS.goal,
    VOICE_FIELDS.role,
    VOICE_FIELDS.instructions,
    VOICE_FIELDS.introduction,
  ]);

/** `{{name}}` placeholders the persona (goal and role) uses. */
export const getPersonaVariables = (values: FormValues): string[] =>
  getPlaceholders(values, [VOICE_FIELDS.goal, VOICE_FIELDS.role]);

/** `{{name}}` placeholders the instructions use. */
export const getInstructionVariables = (values: FormValues): string[] =>
  getPlaceholders(values, [VOICE_FIELDS.instructions]);

/** `{{name}}` placeholders used in the prompt that no variable defines. */
export const getUndefinedVariables = (values: FormValues): string[] => {
  const defined = new Set(getDefinedVariables(values));
  return getUsedVariables(values).filter((name) => !defined.has(name));
};

/** Turns typed text into a placeholder name the runtime resolves: letters, digits, `_`, and `.`. */
export const toVariableName = (text: string) =>
  text
    .replace(/[{}]/g, "")
    .replace(/[\s-]+/g, "_")
    .replace(/[^\w.]/g, "");

export const isPersonaEmpty = (values: FormValues) =>
  ![VOICE_FIELDS.goal, VOICE_FIELDS.role, VOICE_FIELDS.instructions].some((name) =>
    hasText(values[name]),
  );

const hasProviderModel = (value: unknown) =>
  hasText(readKey(value, "provider")) && hasText(readKey(value, "model"));

/** Whether each pipeline step (hear, think, speak) has the models it needs. */
export const getEngineStepReadiness = (values: FormValues): Record<VoiceEngineStepId, boolean> => ({
  speechToText: hasText(readKey(values[VOICE_FIELDS.speechToText], "model")),
  languageModel: hasProviderModel(values[VOICE_FIELDS.languageModel]),
  voice:
    hasText(readKey(values[VOICE_FIELDS.textToSpeech], "model")) &&
    hasText(readKey(values[VOICE_FIELDS.voiceConfig], "voice")),
});

/** Each Prompt stage's mark: to do when it blocks the tab, ready when filled, idle when optional and empty. */
export const getPromptStageMarks = (
  values: FormValues,
): Record<VoicePromptStageId, VoiceStageMark> => {
  const hasGoal = hasText(values[VOICE_FIELDS.goal]);
  const hasInstructions = hasText(values[VOICE_FIELDS.instructions]);
  const isBlocked = !hasGoal && !hasInstructions;
  const hasRoleOrGoal = hasGoal || hasText(values[VOICE_FIELDS.role]);
  const needsIntroduction =
    values[VOICE_FIELDS.firstSpeaker] === "ai" && !hasText(values[VOICE_FIELDS.introduction]);

  const getVariablesMark = (): VoiceStageMark => {
    if (getUndefinedVariables(values).length > 0) return "todo";
    return getDefinedVariables(values).length > 0 ? "ready" : "idle";
  };

  return {
    persona: isBlocked ? "todo" : hasRoleOrGoal ? "ready" : "idle",
    instructions: isBlocked ? "todo" : hasInstructions ? "ready" : "idle",
    opening: needsIntroduction ? "todo" : "ready",
    variables: getVariablesMark(),
  };
};

/** Whether the realtime model has a provider, a model, and the credential it uses. */
export const isRealtimeReady = (values: FormValues) =>
  hasProviderModel(values[VOICE_FIELDS.realtimeModel]) &&
  hasText(readKey(values[VOICE_FIELDS.realtimeModel], "credential_name"));

const getEngineReadiness = (values: FormValues) => {
  if (values[VOICE_FIELDS.engineMode] === "realtime")
    return {
      hint: "Pick a realtime provider, a model, and the credential it uses.",
      isReady: isRealtimeReady(values),
    };

  const steps = getEngineStepReadiness(values);
  if (!steps.languageModel) return { hint: "Pick a language model.", isReady: false };
  if (!steps.speechToText || !steps.voice)
    return {
      hint: "Pick speech-to-text and text-to-speech models, and a voice.",
      isReady: false,
    };
  return { hint: "", isReady: true };
};

const getPromptReadiness = (values: FormValues) => {
  if (!hasText(values[VOICE_FIELDS.goal]) && !hasText(values[VOICE_FIELDS.instructions]))
    return { hint: "Add a goal or instructions.", isReady: false };
  if (values[VOICE_FIELDS.firstSpeaker] === "ai" && !hasText(values[VOICE_FIELDS.introduction]))
    return { hint: "Write what the agent says first.", isReady: false };
  return { hint: "", isReady: true };
};

/** Every required setup check in tab order, each with the hint for its first unmet step. */
export const getVoiceReadiness = (values: FormValues): VoiceReadinessCheck[] => {
  return [
    { section: "prompt", label: "Prompt", ...getPromptReadiness(values) },
    { section: "engine", label: "Engine", ...getEngineReadiness(values) },
  ];
};

/** Required checks the settings still fail, in tab order. */
export const getPendingVoiceChecks = (values: FormValues): VoiceReadinessCheck[] =>
  getVoiceReadiness(values).filter((check) => !check.isReady);

/** Readable list of sections, e.g. "Prompt and Engine". */
export const formatPendingSections = (checks: VoiceReadinessCheck[]) => {
  const labels = checks.map((check) => check.label);
  return labels.length > 1
    ? `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`
    : (labels[0] ?? "");
};
