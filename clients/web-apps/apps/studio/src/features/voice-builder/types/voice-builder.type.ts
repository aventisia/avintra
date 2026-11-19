import type { Icon } from "@phosphor-icons/react";

export type VoiceBuilderSectionId = "prompt" | "engine" | "context" | "tools" | "pronunciation";

export type VoiceReadinessCheck = {
  section: VoiceBuilderSectionId;
  label: string;
  hint: string;
  isReady: boolean;
};

export type VoiceAgentTemplate = {
  id: string;
  name: string;
  description: string;
  goal: string;
  role: string;
  instructions: string;
  introduction: string;
};

export type VoiceBuilderSectionMeta = {
  id: VoiceBuilderSectionId;
  label: string;
  description: string;
  icon: Icon;
};

export type VoiceEngineMode = "pipeline" | "realtime";

export type VoiceEngineStepId = "speechToText" | "languageModel" | "voice";

export type VoiceRealtimeModelConfig = {
  provider?: string;
  model?: string;
  credential_name?: string;
};

export type VoiceStageMark = "ready" | "todo" | "idle";

export type VoicePromptStageId = "persona" | "instructions" | "opening" | "variables";
