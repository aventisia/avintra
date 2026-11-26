export type ModelConfigType = {
  provider: string;
  credential_name: string;
  model: string;
  is_json_output: boolean;
  max_output_tokens: number;
  reasoning_effort?: string;
};

export type VoiceConfigType = {
  language: string;
  voice: string;
  speed: number;
};

export type KBConfigType = {
  knowledgeBase: string[];
  retrievalType: string;
  sourceThreshold: number;
  numberOfChunks: number;
};

export type SkillsConfigType = {
  skills: string[];
};
