import { ModelConfigType } from "@/types/model-config-type";

type SpeechConfig = Pick<ModelConfigType, "model" | "is_byok_enabled" | "credential_name"> | null;

/** Returns why a speech control is disabled, or null when it can run. */
export const resolveMissingSpeechConfigReason = (
  config: SpeechConfig,
  target: "recording" | "replies",
): string | null => {
  const label = target === "recording" ? "Speech to Text" : "Text to Speech";
  const action = target === "recording" ? "start recording" : "hear replies";
  const missingModel = !config?.model?.trim();
  const missingCredential = Boolean(config?.is_byok_enabled) && !config?.credential_name?.trim();

  if (missingModel && missingCredential) {
    return `Select a ${label} model and credential to ${action}.`;
  }
  if (missingModel) return `Select a ${label} model to ${action}.`;
  if (missingCredential) return `Select a credential for ${label} to ${action}.`;
  return null;
};

/** Formats elapsed recording seconds as `m:ss`. */
export const formatRecordingTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

/** Returns true when a request failed before any response arrived. */
export const isNetworkRequestFailure = (error: unknown): boolean => {
  if (typeof error !== "object" || error === null) return false;
  const candidate = error as { isAxiosError?: boolean; response?: unknown };

  return candidate.isAxiosError === true && candidate.response === undefined;
};
