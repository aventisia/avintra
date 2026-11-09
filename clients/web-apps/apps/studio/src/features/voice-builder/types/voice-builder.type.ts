export type VoiceBuilderSectionId = "persona" | "opening" | "brain" | "knowledge" | "pronunciation";

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
