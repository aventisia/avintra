/** Provider/model pair the voice engines address. */
export type VoiceModelConfig = {
  provider: string;
  model: string;
  credential_name?: string | null;
  is_byok_enabled?: boolean;
};

/** Voice settings carried by a Text-to-Speech model. */
export type VoiceSettings = {
  voice?: string;
  language?: string;
  speed?: number;
};

/** Realtime provider settings; empty strings mean the capability is not configured. */
export type RealtimeVoiceSettings = {
  provider: string;
  model: string;
  credentialName: string;
  voice: string;
  language: string;
};
