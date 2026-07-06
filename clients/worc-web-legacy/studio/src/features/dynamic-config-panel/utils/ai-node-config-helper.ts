import {
  KBConfigType,
  ModelConfigType,
  VoiceConfigType,
} from "@/types/model-config-type";

/**
 * Node formData stores provider config under a dynamically-suffixed key,
 * e.g. `__ModelConfig__Inferencing`, `__ModelConfig__SpeechToText`. Pulls out
 * the config object regardless of which node type produced it.
 */
export function getModelConfig(
  data: Record<string, unknown>,
): { config: ModelConfigType; key: string } | null {
  for (const key in data) {
    if (key.includes("__ModelConfig__")) {
      return { config: data[key] as ModelConfigType, key };
    }
  }
  return null;
}

export function getVoiceConfig(
  data: Record<string, unknown>,
): { config: VoiceConfigType; key: string } | null {
  for (const key in data) {
    if (key.includes("__VoiceConfig__")) {
      return { config: data[key] as VoiceConfigType, key };
    }
  }
  return null;
}

export function getKBConfig(
  data: Record<string, unknown>,
): { config: KBConfigType; key: string } | null {
  for (const key in data) {
    if (key.includes("__KbConfig__")) {
      return { config: data[key] as KBConfigType, key };
    }
  }
  return null;
}
