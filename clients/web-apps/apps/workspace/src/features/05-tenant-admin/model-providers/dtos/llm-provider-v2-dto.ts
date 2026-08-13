/**
 * DTOs for the LLM Pipeline v2 provider/model administration API
 * (`/v2/llm/providers` and `/v2/llm/models`).
 */

/** A provider as reported by LiteLLM (dynamic). */
export interface LlmProviderInfoDto {
  /** Provider name (e.g. "openai", "anthropic"). */
  name: string;
  /** Set of capabilities the provider supports (text/embedding/tts/stt, ...). */
  capabilities: string[];
}

/** Response of `GET /v2/llm/providers`. */
export interface LlmProvidersResponseDto {
  providers: LlmProviderInfoDto[];
  count: number;
}

/** Per-model metadata resolved from LiteLLM's cost/model catalog. */
export interface LlmModelInfoDto {
  id: string;
  provider?: string | null;
  capability?: string | null;
  mode?: string | null;
  max_input_tokens?: number | null;
  max_output_tokens?: number | null;
  max_tokens?: number | null;
  input_cost_per_token?: number | null;
  output_cost_per_token?: number | null;
  cache_read_input_token_cost?: number | null;
  supports_function_calling?: boolean | null;
  supports_parallel_function_calling?: boolean | null;
  supports_vision?: boolean | null;
  supports_system_messages?: boolean | null;
  supports_response_schema?: boolean | null;
  supports_prompt_caching?: boolean | null;
  supports_pdf_input?: boolean | null;
  metadata?: Record<string, unknown>;
}

/** Response of `GET /v2/llm/models?provider=X`. */
export interface LlmModelsResponseDto {
  provider: string;
  models: LlmModelInfoDto[];
  count: number;
}
