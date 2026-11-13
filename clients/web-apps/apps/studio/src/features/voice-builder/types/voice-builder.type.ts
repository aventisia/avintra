export type VoiceBuilderSectionId =
  "persona" | "opening" | "brain" | "knowledge" | "pronunciation" | "later";

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

export type VoiceComingLaterGroup = {
  phase: string;
  items: string[];
};
