import { LLMProviderType } from "../types/llm-provider.type";

export const ttsModelProviders: LLMProviderType[] = [
  {
    value: "elevenlabs",
    label: "Elevenlabs",
    models: [{ label: "eleven_v3", value: "eleven_v3", available: false }],
  },
];
