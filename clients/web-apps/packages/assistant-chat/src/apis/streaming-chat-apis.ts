/**
 * Streaming chat completion API.
 *
 * Calls the WorkspaceAPIs SSE proxy (`assist/chats/stream/completions`), which
 * resolves the Chat AI node config for the flow version and relays the
 * llmpipeline /chat/completions stream. This function parses the Server-Sent
 * Events body and yields each `data:` JSON payload string as it arrives.
 *
 * A single `fetch` POST with `stream: true` enables real-time token streaming,
 * tool events, and follow-up suggestions — matching modern AI chat UX.
 */

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/assist/chats/stream`;

export interface StreamingChatRequestDto {
  flowVersionId?: string;
  conversationId?: string | null;
  threadMessages?: { role: string; content: string }[];
  userInput?: string;
  files?: string[];
  isTempChat?: boolean;
  modelProvider?: string;
  modelId?: string;
  credentialName?: string;
  isByokEnabled?: boolean;
  /** Pages the landing chat may send the user to; ignored by agent chats. */
  destinations?: readonly ChatDestination[];
  /** Regenerate or edit: the stored turns after this many user turns are replaced. */
  keepUserTurns?: number;
}

/** A Workspace page the landing chat can send the user to. */
export interface ChatDestination {
  route: string;
  label: string;
}

/** A single approve/deny decision for a pending tool call. */
export interface ApprovalDecisionDto {
  /** Matches the `tool_call_id` surfaced in the approval_required frame. */
  toolCallId: string;
  /** "approve" executes the action; anything else denies it. */
  decision: "approve" | "deny";
}

/**
 * Resume request for a chat turn paused on tool approval. Mirrors
 * WorkspaceAPIs StreamingChatApprovalRequestDto.
 */
export interface StreamingChatApprovalRequestDto {
  flowVersionId: string;
  conversationId: string;
  isTempChat?: boolean;
  decisions: ApprovalDecisionDto[];
}

/**
 * Parses an SSE response body into an async iterator of `data:` payload strings.
 * Skips event/comment/blank lines and strips the trailing `\n\n` separator.
 */
async function* parseSse(body: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Split on the SSE frame separator.
      let sepIndex: number;
      while ((sepIndex = buffer.indexOf("\n\n")) !== -1) {
        const frame = buffer.slice(0, sepIndex);
        buffer = buffer.slice(sepIndex + 2);

        for (const rawLine of frame.split("\n")) {
          const line = rawLine.trim();
          if (!line || line.startsWith(":")) continue; // skip comments/empty
          if (!line.startsWith("data:")) continue; // only data frames

          const payload = line.slice(5).trimStart();
          if (payload) yield payload;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Opens a streaming chat completion request and returns the SSE data payloads.
 *
 * @param request The streaming chat request payload.
 * @param signal Optional AbortController signal to cancel the stream.
 * @param extraHeaders Optional per-app headers (e.g. Studio space scoping).
 */
export async function* streamChatCompletion(
  request: StreamingChatRequestDto,
  signal?: AbortSignal,
  extraHeaders?: Record<string, string>,
): AsyncGenerator<string> {
  const response = await fetch(`${baseAPIURL}/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      ...extraHeaders,
    },
    credentials: "include", // forward the JWT cookie for auth
    body: JSON.stringify(request),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Streaming request failed (${response.status}).`);
  }

  if (!response.body) {
    throw new Error("Streaming response has no body.");
  }

  yield* parseSse(response.body);
}

/**
 * Resumes a paused chat turn with the user's tool-approval decisions and
 * returns the SSE data payloads of the continuation.
 *
 * Calls the WorkspaceAPIs SSE proxy (`assist/chats/stream/approvals`), which
 * relays the llmpipeline /chat/completions/approvals stream. The continuation
 * uses the same normalized frame protocol as a regular completion.
 *
 * @param request The approval decisions payload.
 * @param signal Optional AbortController signal to cancel the stream.
 * @param extraHeaders Optional per-app headers (e.g. Studio space scoping).
 */
export async function* streamApprovalDecisions(
  request: StreamingChatApprovalRequestDto,
  signal?: AbortSignal,
  extraHeaders?: Record<string, string>,
): AsyncGenerator<string> {
  const response = await fetch(`${baseAPIURL}/approvals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      ...extraHeaders,
    },
    credentials: "include", // forward the JWT cookie for auth
    body: JSON.stringify(request),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Approval request failed (${response.status}).`);
  }

  if (!response.body) {
    throw new Error("Streaming response has no body.");
  }

  yield* parseSse(response.body);
}
