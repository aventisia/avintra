import { FlowAssistantFrame } from "../types/flow-assistant-frame-type";
import { FlowAssistantQuestionSlot } from "../types/flow-assistant-question-type";

const collectDataPayloads = (frame: string): string[] => {
  const payloads: string[] = [];
  for (const rawLine of frame.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith(":") || !line.startsWith("data:")) continue;

    const payload = line.slice(5).trimStart();
    if (payload) payloads.push(payload);
  }
  return payloads;
};

/** Yields the `data:` payload strings of an SSE response body. */
export async function* parseSsePayloads(body: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer = (buffer + decoder.decode(value, { stream: true })).replace(/\r\n?/g, "\n");

      let separatorIndex: number;
      while ((separatorIndex = buffer.indexOf("\n\n")) !== -1) {
        const frame = buffer.slice(0, separatorIndex);
        buffer = buffer.slice(separatorIndex + 2);
        yield* collectDataPayloads(frame);
      }
    }

    if (buffer.trim()) yield* collectDataPayloads(buffer);
  } finally {
    reader.releaseLock();
  }
}

const isQuestionSlot = (value: unknown): value is FlowAssistantQuestionSlot => {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<FlowAssistantQuestionSlot>;
  if (typeof candidate.key !== "string" || typeof candidate.label !== "string") return false;
  if (
    candidate.nodeName !== undefined &&
    candidate.nodeName !== null &&
    typeof candidate.nodeName !== "string"
  )
    return false;
  return (
    candidate.options === undefined ||
    (Array.isArray(candidate.options) &&
      candidate.options.every((option) => typeof option === "string"))
  );
};

/** Parses one SSE data payload into a normalized flow-assistant frame. */
export const parseFlowAssistantFrame = (payload: string): FlowAssistantFrame | null => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(payload);
  } catch {
    return null;
  }

  if (typeof parsed !== "object" || parsed === null) return null;

  const candidate = parsed as { type?: unknown; output?: unknown; message?: unknown };
  switch (candidate.type) {
    case "delta":
      return {
        type: "delta",
        output: typeof candidate.output === "string" ? candidate.output : "",
      };
    case "graph_proposal":
      return { type: "graph_proposal", output: candidate.output };
    case "question":
      return {
        type: "question",
        output: typeof candidate.output === "string" ? candidate.output : "",
      };
    case "questions":
      if (Array.isArray(candidate.output) && candidate.output.every(isQuestionSlot))
        return { type: "questions", output: candidate.output };
      console.warn("Dropping malformed flow-assistant questions frame.");
      return null;
    case "done":
      return {
        type: "done",
        output: typeof candidate.output === "string" ? candidate.output : undefined,
      };
    case "error":
      return {
        type: "error",
        message:
          typeof candidate.message === "string"
            ? candidate.message
            : "The assistant request failed.",
      };
    default:
      console.warn("Dropping unknown flow-assistant frame.", payload.slice(0, 120));
      return null;
  }
};
