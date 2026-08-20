// ─── Add / replace in your llm-providers-dto.ts ─────────────────────────────

export type STTInputMode = "file" | "url" | "text";

/**
 * Matches STTProviderRequest on the backend.
 * `input` is always a string on the wire:
 *   - mode "file" → base64-encoded audio bytes
 *   - mode "url"  → audio URL (HttpUrl)
 *   - mode "text" → plain text string
 * `input_mode` is FE-only metadata stripped before sending if the BE doesn't accept it,
 * but keeping it here makes ExecuteButton self-contained.
 */
export interface STTRequestDto {
  input: string;
  input_mode: STTInputMode; // stripped by API layer if BE rejects unknown fields

  provider: string;
  model: string;

  audio_format?: string; // default "audio/wav" on BE
  language?: string | null; // BCP-47 e.g. "en-US"; null = auto-detect
  stream: boolean;

  credential_name?: string | null;
  is_byok_enabled?: boolean;

  ref_type: string; // "Agent" | "Workflow"
  ref_id: string;
  ref_name: string;
  action: string; // "AgentExecution" | "WorkflowExecution"
  agent_name?: string | null;
}

/**
 * Matches STTProviderResponse on the backend.
 */
export interface STTResponseDto {
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
  created_on: string; // ISO datetime from BE
  ref_id?: string | null;
  ref_type?: string | null;
  agent_name?: string | null;
  action?: string | null;
}

/**
 * Matches STTProviderStreamChunk — reserved for future streaming support.
 */
export interface STTStreamChunkDto {
  provider: string;
  output: string;
  request_id?: string | null;
  is_final?: boolean;
  created_on: string;
}
