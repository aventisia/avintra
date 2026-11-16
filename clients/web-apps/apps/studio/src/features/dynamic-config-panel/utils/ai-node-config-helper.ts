import {
  KBConfigType,
  ModelConfigType,
  SkillsConfigType,
  VoiceConfigType,
} from "@/types/model-config-type";

export interface ToolActionConfig {
  action: string;
  approval: "auto" | "human";
}

export interface ToolsConfigItem {
  tool: string;
  credential_name: string;
  actions: ToolActionConfig[];
}

export interface SuggestionsConfig {
  defaultActions: string[];
  enableDynamicActions: boolean;
  followUpMessagePrompt: string;
}

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

export function getSkillsConfig(
  data: Record<string, unknown>,
): { config: SkillsConfigType; key: string } | null {
  for (const key in data) {
    if (key.includes("__SkillsConfig__")) {
      return { config: data[key] as SkillsConfigType, key };
    }
  }
  return null;
}

export function getToolsConfig(
  data: Record<string, unknown>,
): { config: ToolsConfigItem[]; key: string } | null {
  for (const key in data) {
    if (key.includes("__ToolsConfig__")) {
      return { config: data[key] as ToolsConfigItem[], key };
    }
  }
  return null;
}

export function getSuggestionsConfig(
  data: Record<string, unknown>,
): { config: SuggestionsConfig; key: string } | null {
  for (const key in data) {
    if (key.includes("__RecommendedActionsConfig__")) {
      return { config: data[key] as SuggestionsConfig, key };
    }
  }
  return null;
}

export interface PronunciationConfigEntry {
  term: string;
  pronunciation: string;
}

/** Reports whether a VoiceAgent feature toggle is on, falling back to legacy behavior when absent. */
export function isVoiceFeatureEnabled(
  data: Record<string, unknown>,
  toggleKey: string,
  legacyOn: boolean,
): boolean {
  const value = data[toggleKey];

  return value === undefined ? legacyOn : value === true;
}

export function getPronunciationConfig(
  data: Record<string, unknown>,
): { config: PronunciationConfigEntry[]; key: string } | null {
  for (const key in data) {
    if (key.includes("__Pronunciation__Voice")) {
      const config = data[key] as PronunciationConfigEntry[];

      return {
        config: isVoiceFeatureEnabled(data, "__PronunciationEnabled__Voice", true) ? config : [],
        key,
      };
    }
  }
  return null;
}

export interface SfxConfig {
  enabled: boolean;
  toolCallCueUrl: string;
  ambienceUrl: string;
}

export function getSfxConfig(data: Record<string, unknown>): SfxConfig {
  const masterOn = isVoiceFeatureEnabled(data, "__SfxEnabled__Voice", false);
  const masterExplicitlyOff = data["__SfxEnabled__Voice"] === false;
  const cueOn = isVoiceFeatureEnabled(data, "__SfxToolCallCueEnabled__Voice", true);
  const ambienceOn = isVoiceFeatureEnabled(data, "__SfxAmbienceEnabled__Voice", true);
  const toolCallCueUrl = data["__SfxToolCallCueUrl__Voice"];
  const ambienceUrl = data["__SfxAmbienceUrl__Voice"];

  return {
    enabled: masterOn,
    toolCallCueUrl:
      masterExplicitlyOff || !cueOn ? "" : typeof toolCallCueUrl === "string" ? toolCallCueUrl : "",
    ambienceUrl:
      masterExplicitlyOff || !ambienceOn ? "" : typeof ambienceUrl === "string" ? ambienceUrl : "",
  };
}
