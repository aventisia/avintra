/**
 * Incoming request for a streaming chat completion against a Chat Agent flow.
 * The Chat AI node config is resolved server-side, so only the conversation
 * context needs to be sent.
 */
export interface StreamingChatRequestDto {
  /** Flow version that owns the Chat AI node configuration. */
  flowVersionId: string;

  /** Existing conversation id, or null to allocate a new one. */
  conversationId?: string | null;

  /** Ordered chat messages already exchanged (excluding the current user turn). */
  threadMessages?: ChatMessageItemDto[];

  /** The latest user message text. */
  userInput?: string;

  /** Base64 / data-URL or http(s) file references to attach to the current turn. */
  files?: string[];

  /** When true, the conversation is kept in-memory only (Studio test panel). */
  isTempChat?: boolean;
}

/** A single role/content message in a conversation thread. */
export interface ChatMessageItemDto {
  role: string;
  content: string;
}

/**
 * The server relays llmpipeline /chat/completions SSE frames. Each `data:`
 * payload is a serialized chunk (LangGraph event or final LLMResponse).
 * We forward the raw JSON string so the adapter can parse typed fields.
 */
export interface StreamingChatChunkDto {
  /** Raw JSON payload carried by a single SSE `data:` frame. */
  data: string;
}
