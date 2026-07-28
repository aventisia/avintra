import { LLMProviderType } from "../types/llm-provider.type";

export const sttModelProviders: LLMProviderType[] = [
  {
    value: "elevenlabs",
    label: "Elevenlabs",
    models: [
      { label: "scribe_v2", value: "scribe_v2", available: false },
      {
        label: "scribe_v2_realtime",
        value: "scribe_v2_realtime",
        available: false,
      },
    ],
  },
];
