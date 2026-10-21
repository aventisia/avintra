/** Mirrors the llmpipeline TTS request contract used by the workspace voice feature. */
export interface TtsRequestDto {
  provider: string;
  input: string;
  model: string;

  voice_id?: string | null;
  language?: string | null;
  speed?: number;
  pitch?: number;
  pronunciations?: Array<{ term: string; pronunciation: string }> | null;
  stream: boolean;

  credential_name?: string | null;
  is_byok_enabled?: boolean;

  ref_type: string;
  ref_id: string;
  ref_name: string;
  action: string;
  agent_name?: string | null;
}

/** Mirrors the llmpipeline TTS response contract. */
export interface TtsResponseDto {
  provider: string;
  model: string;

  status: "pending" | "processing" | "completed" | "failed";

  output?: string | null;
  stream: boolean;

  credential_name?: string | null;
  is_byok_enabled?: boolean;

  ref_id?: string | null;
  ref_type?: string | null;
  agent_name?: string | null;
  action?: string | null;

  token_count?: number | null;
  time_taken?: number | null;

  created_on: string;
  error?: string | null;
}
