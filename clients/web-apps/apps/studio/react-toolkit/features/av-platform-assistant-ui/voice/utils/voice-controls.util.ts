import { ModelConfigType } from "@/types/model-config-type";

type SpeechConfig = Pick<ModelConfigType, "model" | "credential_name"> | null;

/** Returns why a speech control is disabled, or null when it can run. */
export const resolveMissingSpeechConfigReason = (
  config: SpeechConfig,
  target: "recording" | "replies",
): string | null => {
  const label = target === "recording" ? "Speech to Text" : "Text to Speech";
  const action = target === "recording" ? "start recording" : "hear replies";
  const missingModel = !config?.model?.trim();
  // IMPORTANT NOTE: a blank credential runs on the platform path, so only the model is required.
  if (missingModel) return `Select a ${label} model to ${action}.`;
  return null;
};
