// ─── TTS DTOs ─────────────────────────────────────────────────────────────

/**
 * Matches TTSProviderRequest on the backend.
 */
export interface TTSRequestDto {
  provider: string;
  input: string;
  model: string;

  voice_id?: string | null;
  language?: string | null;
  speed?: number;
  pitch?: number;
  stream: boolean;

  credential_name?: string | null;
  is_byok_enabled?: boolean;

  ref_type: string;
  ref_id: string;
  ref_name: string;
  action: string;
}

/**
 * Matches TTSProviderResponse on the backend.
 */
export interface TTSResponseDto {
  provider: string;
  model: string;

  status: "pending" | "processing" | "completed" | "failed";

  output?: string | null;
  stream: boolean;

  credential_name?: string | null;
  is_byok_enabled?: boolean;

  ref_id?: string | null;
  ref_type?: string | null;
  ref_name?: string | null;
  action?: string | null;

  token_count?: number | null;
  time_taken?: number | null;

  created_on: string;
  error?: string | null;
}

/**
 * Matches TTSProviderStreamChunk.
 */
export interface TTSStreamChunkDto {
  provider: string;
  output?: string | null;
  request_id?: string | null;
  is_final?: boolean;
  created_on: string;
}
