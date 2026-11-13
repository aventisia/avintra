export type VoiceOption = {
  label: string;
  value: string;
  sample?: string | null;
};

export type VoiceProviderData = {
  languages: { label: string; value: string }[];
  voices: VoiceOption[];
};
