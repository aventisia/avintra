/** Mirrors the llmpipeline STT request contract used by the workspace voice feature. */
export interface SttRequestDto {
  input: string;
  input_mode: "file" | "url" | "text";

  provider: string;
  model: string;

  audio_format?: string;
  language?: string | null;
  stream: boolean;

  credential_name?: string | null;
  is_byok_enabled?: boolean;

  ref_type: string;
  ref_id: string;
  ref_name: string;
  action: string;
  agent_name?: string | null;
}

/** Mirrors the llmpipeline STT response contract. */
export interface SttResponseDto {
  provider: string;
  model: string;
  status: "pending" | "processing" | "completed" | "failed";
  output?: string | null;
  error?: string | null;
  stream: boolean;
  credential_name?: string | null;
  is_byok_enabled?: boolean;
  duration_seconds?: number | null;
  token_count?: number | null;
  time_taken?: number | null;
  created_on: string;
  ref_id?: string | null;
  ref_type?: string | null;
  agent_name?: string | null;
  action?: string | null;
}
