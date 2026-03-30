import { LLMRequestDto } from "@/features/dynamic-config-panel/dtos/llm-providers-dto";

/**
 * Parameters for initiating a streamed LLM (Large Language Model) generation request.
 *
 * @property request - The LLM request payload containing the necessary data for generation.
 * @property signal - An AbortSignal to allow cancellation of the streaming request.
 */
type StreamLLMGenerateParams = {
  request: LLMRequestDto;
  signal: AbortSignal;
};

// Base path for llmpipeline endpoints.
const baseAPIURL: string = `${import.meta.env.VITE_LLMPIPELINE_API_PATH}/llm`;

/**
 * Attempts to extract a meaningful error message from a failed HTTP response.
 *
 * Strategy:
 * 1. Prefer JSON `title` or `message` when available.
 * 2. Fallback to plain response text.
 * 3. Fallback to status-based generic text.
 */
const resolveErrorMessage = async (response: Response): Promise<string> => {
  try {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = (await response.json()) as {
        title?: string;
        message?: string;
      };

      return (
        body.title || body.message || `Request failed with ${response.status}`
      );
    }

    const plainText = await response.text();
    return plainText || `Request failed with ${response.status}`;
  } catch {
    return `Request failed with ${response.status}`;
  }
};

/**
 * Parses one streamed line from the backend response.
 *
 * Accepts both raw JSON lines and SSE-formatted lines (`data: {...}`).
 * Returns:
 * - `string` for model output chunk
 * - `null` for control/no-op lines (empty, `[DONE]`, invalid JSON)
 */
const parseChunkLine = (line: string): string | null => {
  const normalized = line.startsWith("data:") ? line.slice(5).trim() : line;

  if (!normalized || normalized === "[DONE]") return null;

  try {
    const payload = JSON.parse(normalized) as {
      output?: string;
      error?: string;
    };

    if (payload.error) throw new Error(payload.error);

    return payload.output ?? "";
  } catch {
    return null;
  }
};

/**
 * Streams generated text chunks from the llm `/generate` endpoint.
 *
 * Why `fetch` here instead of the shared axios instance:
 * 1. This endpoint returns a streaming response that must be consumed chunk-by-chunk.
 * 2. In browsers, axios is backed by XHR and does not expose a native `ReadableStream`
 *    reader (`response.body.getReader()`) needed for incremental parsing.
 * 3. `fetch` provides direct stream access so the UI can render partial output in real time.
 *
 * Note: axios remains the preferred client for regular non-streaming JSON APIs.
 *
 * Flow:
 * 1. POST request payload with `stream: true` to backend.
 * 2. Read response as a byte stream.
 * 3. Decode bytes to text and split by newline boundaries.
 * 4. Parse each line into output chunks and yield incrementally.
 */
export async function* streamLLMGenerate({
  request,
  signal,
}: StreamLLMGenerateParams): AsyncGenerator<string, void, unknown> {
  // Set content type for JSON payload; credentials included for auth cookies.
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Initiate fetch request to llm generate endpoint with streaming response.
  const response = await fetch(`${baseAPIURL}/generate`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(request),
    signal,
  });

  // Handle HTTP errors upfront before processing stream.
  if (!response.ok) {
    throw new Error(await resolveErrorMessage(response));
  }

  // Ensure response body is available for streaming.
  if (!response.body) {
    throw new Error("Streaming is unavailable. Empty response body.");
  }

  const reader = response.body.getReader(); // Get a reader for the response stream.
  const decoder = new TextDecoder(); // Decoder to convert byte chunks to text.
  // Keeps partial line fragments between chunks until a newline arrives.
  let buffer = "";

  // Continuously read from the stream until completion or error.
  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    // Decode incremental bytes and append to pending buffer.
    buffer += decoder.decode(value, { stream: true });
    
    // Split complete lines; keep last fragment in `buffer`.
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const chunkText = parseChunkLine(line.trim());
      // Yield only non-empty model output fragments.
      if (chunkText) yield chunkText;
    }
  }

  // Flush any remaining fragment after stream completion.
  const finalChunkText = parseChunkLine(buffer.trim());
  if (finalChunkText) yield finalChunkText;
}
