import type { VoiceCallScriptTurn } from "@avplatform/assistant-chat";

export type SampleVoiceAgent = {
  id: string;
  name: string;
  description: string;
  versionNumber: number;
  language: string;
  voice: string;
  firstSpeaker: "ai" | "human";
  script: VoiceCallScriptTurn[];
};
