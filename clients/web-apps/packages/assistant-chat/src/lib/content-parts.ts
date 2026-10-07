/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Turns the normalized chat frame protocol into assistant-ui content parts.
 *
 * The live model adapter and the reloaded conversation history share this
 * builder, so a rehydrated thread renders exactly like the streamed one:
 * reasoning, skills, tool calls, approvals, and text in their original order.
 */
import { isPendingApprovalPart } from "./approval-parts";

/** One normalized SSE frame (or a JSON-serialized `LLMChunkResponse`). */
export type NormalizedChatFrame = {
  type?: string;
  output?: unknown;
  message?: string;
};

/** A rendered assistant content part (text/reasoning/tool-call/data). */
export type ContentPart = Record<string, any> & { type: string };

export type ContentPartsBuilder = {
  /** Applies one frame; returns true when the rendered parts changed. */
  apply: (frame: NormalizedChatFrame | undefined) => boolean;
  /** Live content parts (mutated in place). */
  readonly parts: ContentPart[];
  /** True once any non-empty text has been pushed. */
  readonly hasText: boolean;
  isEmpty: () => boolean;
  hasPendingApproval: () => boolean;
  /** Appends plain text (placeholders and stream errors). */
  pushText: (text: string) => void;
};

export type CreateContentPartsBuilderOptions = {
  /**
   * Tool-call ids rendered outside this builder. A live approval resume keeps
   * the paused card on the message, so the result frames for those ids must not
   * add a duplicate card. Rehydration leaves this empty: the approval part
   * created by the paused turn's frames is upserted in place.
   */
  skipToolCallIds?: Iterable<string>;
};

/**
 * Creates a stateful builder that folds normalized frames into content parts.
 * Mirrors the chat stream's rendering rules exactly, including the preliminary
 * → completion upsert for every tool call.
 */
export function createContentPartsBuilder(
  options?: CreateContentPartsBuilderOptions,
): ContentPartsBuilder {
  const parts: ContentPart[] = [];
  const toolAccumulator: Record<string, ContentPart> = {};
  const skipIds = new Set<string>(options?.skipToolCallIds ?? []);
  let reasoningText = "";
  let hasText = false;

  const pushText = (text: string) => {
    const last = parts[parts.length - 1];
    if (last && last.type === "text") {
      last.text += text;
    } else {
      parts.push({ type: "text", text });
    }
    hasText ||= text.trim().length > 0;
  };

  // Keep streamed reasoning in a single part so assistant-ui's native
  // chain-of-thought grouping renders it as one block.
  const setReasoningPart = () => {
    const idx = parts.findIndex((part) => part.type === "reasoning");
    if (idx !== -1) parts[idx].text = reasoningText;
    else parts.push({ type: "reasoning", text: reasoningText });
  };

  const apply = (frame: NormalizedChatFrame | undefined): boolean => {
    const output = (frame?.output ?? {}) as any;

    switch (frame?.type) {
      case "reasoning": {
        const reasoning = typeof frame.output === "string" ? frame.output : "";
        if (!reasoning) return false;
        reasoningText += reasoning;
        setReasoningPart();
        return true;
      }
      case "delta": {
        const text = typeof frame.output === "string" ? frame.output : "";
        if (!text) return false;
        pushText(text);
        return true;
      }
      case "tool_call": {
        // Emitted twice: a preliminary frame when the tools node starts (no
        // `content`) and a completion frame with the result. Upsert by id so
        // the card transitions running → done while keeping the name/args from
        // the start frame when a completion frame omits them.
        const toolCallId = output?.tool_call_id || `tool-${Object.keys(toolAccumulator).length}`;
        if (skipIds.has(toolCallId)) return false;

        const frameName = typeof output?.name === "string" ? output.name : "";
        const frameArgs = output?.args;
        const hasResult = output?.content !== undefined && output?.content !== null;
        const isError = output?.status === "error";

        const existing = toolAccumulator[toolCallId];
        if (existing) {
          if (!hasResult) return false;
          if (frameName) existing.toolName = frameName;
          if (frameArgs && Object.keys(frameArgs).length > 0) {
            existing.args = frameArgs;
            existing.argsText = JSON.stringify(frameArgs);
          }
          existing.result = output.content;
          if (isError) existing.isError = true;
          delete existing.isPreliminary;
          return true;
        }

        const args = frameArgs ?? output;
        const argsText =
          typeof output?.content === "string" && !frameArgs ? output.content : JSON.stringify(args);
        const part: ContentPart = {
          type: "tool-call",
          toolCallId,
          toolName: frameName || "tool",
          argsText,
          args,
          ...(hasResult
            ? {
                result: output.content,
                ...(isError ? { isError: true } : {}),
              }
            : { isPreliminary: true }),
        };
        toolAccumulator[toolCallId] = part;
        parts.push(part);
        return true;
      }
      case "approval_required": {
        // The server paused before executing human-approval actions. The tools
        // node emits a preliminary frame first, so gate that part in place
        // instead of appending a duplicate card for the same tool_call_id. The
        // `id` is required: the runtime addresses a gate by `approval.id`.
        const toolCallId = output?.tool_call_id || `approval-${parts.length}`;
        const toolName = output?.name || "tool";
        const args = output?.args || {};

        const existing = toolAccumulator[toolCallId];
        if (existing) {
          existing.toolName = toolName || existing.toolName;
          existing.args = args;
          existing.argsText = JSON.stringify(args);
          delete existing.result;
          delete existing.isPreliminary;
          delete existing.isError;
          existing.approval = { id: toolCallId };
        } else {
          const part: ContentPart = {
            type: "tool-call",
            toolCallId,
            toolName,
            argsText: JSON.stringify(args),
            args,
            approval: { id: toolCallId },
          };
          toolAccumulator[toolCallId] = part;
          parts.push(part);
        }
        return true;
      }
      case "skill": {
        // Surface skill selection as a native data part so the UI can render
        // it inside the chain-of-thought group.
        const skillName = output?.name || frame.output;
        if (!skillName) return false;
        parts.push({ type: "data", name: "skill", data: { name: skillName } });
        return true;
      }
      case "tools": {
        // Final list of tool results — merge into emitted tool-call parts.
        if (!Array.isArray(frame.output)) return false;
        (frame.output as any[]).forEach((tool, idx) => {
          const id = tool?.call_id || `tool-${idx}`;
          if (skipIds.has(id)) return;
          const existing = toolAccumulator[id];
          const name = tool?.output?.action || tool?.type || "tool";
          if (existing) {
            existing.toolName = name;
            existing.args = tool?.output || existing.args;
            existing.argsText = JSON.stringify(tool?.output || {});
            existing.result = tool?.output || tool;
            delete existing.isPreliminary;
          } else {
            parts.push({
              type: "tool-call",
              toolCallId: id,
              toolName: name,
              argsText: JSON.stringify(tool?.output || {}),
              args: tool?.output || {},
              result: tool?.output || tool,
            });
          }
        });
        return true;
      }
      case "done": {
        // Fallback only: duplicate the final text if no deltas streamed.
        const text = typeof frame.output === "string" ? frame.output : "";
        if (text && !hasText) pushText(text);
        return false;
      }
      case "error": {
        const detail =
          typeof frame?.message === "string" && frame.message
            ? frame.message
            : typeof frame?.output === "string"
              ? frame.output
              : "";
        pushText(detail || "An error occurred during the request.");
        return false;
      }
      default:
        return false;
    }
  };

  return {
    apply,
    get parts() {
      return parts;
    },
    get hasText() {
      return hasText;
    },
    isEmpty: () => parts.length === 0,
    hasPendingApproval: () => parts.some(isPendingApprovalPart),
    pushText,
  };
}

/**
 * Rebuilds the assistant content parts of a persisted turn from its recorded
 * frames. Approval decisions are applied to the matching gates, and any gate
 * that is still undecided becomes `expired` (a reloaded page cannot resume the
 * server pause).
 */
export function buildContentPartsFromFrames(
  frames: readonly NormalizedChatFrame[],
  decisions?: Record<string, string> | null,
): ContentPart[] {
  const builder = createContentPartsBuilder();
  for (const frame of frames) builder.apply(frame);

  for (const [toolCallId, decision] of Object.entries(decisions ?? {})) {
    const part = builder.parts.find(
      (candidate) =>
        candidate.type === "tool-call" && candidate.toolCallId === toolCallId && candidate.approval,
    );
    if (part) {
      part.approval = { ...part.approval, approved: decision === "approve" };
    }
  }

  for (const part of builder.parts) {
    if (isPendingApprovalPart(part)) {
      part.approval = { ...part.approval, resolution: "expired" };
    }
  }

  return builder.parts;
}
