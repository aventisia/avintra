import { humanizeToolLabel } from "@avplatform/assistant-chat";

type ActivityPart = { type: string; toolName?: string; result?: unknown; isError?: boolean };

/**
 * One-line summary of a run of reasoning, skill and tool steps: the step in
 * progress while the assistant is still on it, a tally once it has moved on.
 */
export const describeActivity = (parts: readonly ActivityPart[], isActive: boolean): string => {
  if (isActive) {
    const last = parts.at(-1);
    return last?.type === "tool-call" && last.result === undefined
      ? humanizeToolLabel(last.toolName)
      : "Thinking";
  }
  const tools = parts.filter((part) => part.type === "tool-call");
  if (tools.length === 0) return "Thought process";
  const failed = tools.filter((part) => part.isError).length;
  return `Used ${tools.length} ${tools.length === 1 ? "tool" : "tools"}${failed ? `, ${failed} failed` : ""}`;
};
