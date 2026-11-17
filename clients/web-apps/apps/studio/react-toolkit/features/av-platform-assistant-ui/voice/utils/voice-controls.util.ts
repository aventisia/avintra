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
  // IMPORTANT NOTE: voice sub-configs hide the BYOK switch and always run on a vault
  // credential, so a model without one cannot run.
  const missingCredential = !config?.credential_name?.trim();

  if (missingModel && missingCredential) {
    return `Select a ${label} model and credential to ${action}.`;
  }
  if (missingModel) return `Select a ${label} model to ${action}.`;
  if (missingCredential) return `Select a credential for ${label} to ${action}.`;
  return null;
};
