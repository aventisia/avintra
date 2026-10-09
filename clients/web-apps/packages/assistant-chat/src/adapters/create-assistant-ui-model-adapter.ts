/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChatModelAdapter, ThreadMessage, ThreadUserMessagePart } from "@assistant-ui/react";

import { streamApprovalDecisions, streamChatCompletion } from "../apis/streaming-chat-apis";
import { isPendingApprovalPart } from "../lib/approval-parts";
import { createContentPartsBuilder } from "../lib/content-parts";
import { LLMMessageType } from "../types/llm-message.type";

export type CreateAssistantUIModelAdapterParams = {
  flowVersionId: string;
  // Accepts the lazy getter instead of a static string
  getConversationId: (allocateIfMissing: boolean) => Promise<string | undefined>;
  onRequestComplete?: () => void;
  onSuggestionsUpdate?: (actions: string[]) => void;
  /** Called for every streamed text delta so observers can synthesize speech incrementally. */
  onTextDelta?: (delta: string) => void;
  /** Called once per run when streaming settles (success, error, or abort). */
  onRunFinished?: () => void;
  /** When true, the conversation is kept in-memory only (Studio test panel). */
  isTempChat?: boolean;
  /**
   * Extra request headers for both stream calls (e.g. Studio space scoping
   * headers). Workspace omits this; Studio passes its space-header getter.
   */
  getExtraHeaders?: () => Record<string, string>;
};

/**
 * Translates rich UI message state into a plain string log.
 */
const toMessageText = (
  content: readonly ThreadUserMessagePart[] | ThreadMessage["content"],
): string => {
  return content
    .map((part) => {
      // Reasoning/thinking traces are intentionally excluded so they are not
      // sent back to the LLM as conversation context.
      if (part.type === "text") return part.text;

      if (part.type === "tool-call") {
        const p = part as any;
        let contextText = `\n[Tool Call: ${p.toolName}]\nArgs: ${p.argsText || JSON.stringify(p.args || {})}\n`;
        if (p.result) {
          const resultStr = typeof p.result === "string" ? p.result : JSON.stringify(p.result);
          contextText += `\n[System Environment Response to ${p.toolName}]\nResult: ${resultStr}\n`;
        }
        return contextText;
      }
      return "";
    })
    .filter(Boolean)
    .join("\n");
};

/**
 * Formats the active thread into standard DTO messages.
 */
function mapThreadToLLMMessages(messages: readonly ThreadMessage[]): LLMMessageType[] {
  return messages
    .filter((msg) => msg.role === "user" || msg.role === "assistant" || msg.role === "system")
    .map((msg) => ({
      role: msg.role as LLMMessageType["role"],
      content: toMessageText(msg.content),
    }))
    .filter((msg) => msg.content.trim().length > 0);
}

/**
 * Extracts file references (data URLs / http(s) URLs) from a user message's
 * attachments so they can be forwarded to the LLM pipeline.
 */
function extractFilesFromMessage(message: ThreadMessage | undefined): string[] {
  if (!message) return [];
  const files: string[] = [];
  const attachments = (message as any).attachments as any[] | undefined;
  if (Array.isArray(attachments)) {
    for (const att of attachments) {
      const src = att?.src || att?.url || att?.file?.src;
      if (typeof src === "string" && src) files.push(src);
    }
  }
  return files;
}

/**
 * Collects resolved tool-approval decisions from the last thread message.
 *
 * assistant-ui re-runs the model adapter after every approval in the batch is
 * answered and passes the updated assistant message last, which is how a
 * resumed turn is detected. Unresolved approvals (no `approved`, no
 * `resolution`) are ignored because the runtime only continues once the whole
 * batch is decided.
 */
function collectApprovalDecisions(message: ThreadMessage | undefined): ApprovalDecision[] {
  if (!message || message.role !== "assistant") return [];

  const decisions: ApprovalDecision[] = [];
  for (const part of message.content) {
    if (part.type !== "tool-call") continue;
    const approval = (part as any).approval as
      { approved?: boolean; resolution?: "cancelled" | "expired" } | undefined;
    if (!approval || approval.approved === undefined) continue;
    decisions.push({
      toolCallId: part.toolCallId,
      decision: approval.approved ? "approve" : "deny",
    });
  }
  return decisions;
}

/** A single resolved user decision collected from the thread state. */
type ApprovalDecision = {
  toolCallId: string;
  decision: "approve" | "deny";
};

/**
 * Streams the chat completion from the normalized llmpipeline endpoint and
 * emits incremental text deltas, tool calls, follow-ups, and the final result.
 *
 * The server (WorkspaceAPIs -> llmpipeline /chat/completions/normalized) sends
 * SSE frames of shape:
 *   { type: "delta",             output: "<partial text>" }
 *   { type: "tool_call",         output: { tool_call_id, content } }
 *   { type: "approval_required", output: { tool_call_id, name, args } }
 *   { type: "tools",             output: [ { action, ... } ] }
 *   { type: "followup",          output: [ "suggestion", ... ] }
 *   { type: "done",              output: "<final text>" }
 */
export const createAssistantUIModelAdapter = ({
  flowVersionId,
  getConversationId,
  onRequestComplete,
  onSuggestionsUpdate,
  onTextDelta,
  onRunFinished,
  isTempChat = false,
  getExtraHeaders,
}: CreateAssistantUIModelAdapterParams): ChatModelAdapter => {
  // Last conversation id observed in a frame. Temporary chats never allocate
  // one client-side, so this is the only handle that can resume their approvals.
  let lastServerConversationId: string | undefined;

  // Approval ids already submitted to the approvals endpoint. A single
  // assistant message can pause on several approval batches in sequence (a
  // gated tool runs, the model then calls another gated tool), and
  // assistant-ui keeps every resolved approval on the message, so a later
  // resume reports the earlier decisions too. Resubmitting a consumed decision
  // is rejected by the server, so only send each one once.
  const submittedApprovalIds = new Set<string>();

  return {
    async *run(options) {
      // Persisted chats own their history server-side (checkpoint + DB); only
      // temporary chats rely on the client sending the prior turns.
      const allMessagesExceptLast = options.messages.slice(0, -1);
      const threadMessages = isTempChat ? mapThreadToLLMMessages(allMessagesExceptLast) : [];

      const lastMessage = options.messages[options.messages.length - 1];

      // Continuation runs (approvals answered / tool results added) reuse the
      // same assistant message, which the runtime passes separately from the
      // conversation history.
      const currentAssistantMessage = options.unstable_getMessage?.();

      // A run whose assistant message carries resolved approvals is the
      // continuation of a paused turn: resume it instead of starting a new
      // user turn. Only decisions the server has not already consumed are
      // submitted, since earlier batches stay on the message as decided.
      const resolvedApprovalDecisions = collectApprovalDecisions(currentAssistantMessage);
      const isApprovalResume = resolvedApprovalDecisions.length > 0;
      if (!isApprovalResume) submittedApprovalIds.clear();
      const approvalDecisions = resolvedApprovalDecisions.filter(
        (decision) => !submittedApprovalIds.has(decision.toolCallId),
      );

      // Tool-call frames for these ids are the executed approval actions. The
      // approval card already occupies the toolCallId in this message, so the
      // duplicate result part is skipped (the model summarizes the outcome).
      const approvalToolCallIds = new Set<string>();
      for (const part of currentAssistantMessage?.content ?? []) {
        if (part.type === "tool-call" && part.approval) {
          approvalToolCallIds.add(part.toolCallId);
        }
      }

      const userInputText = lastMessage ? toMessageText(lastMessage.content) : "";
      const files = extractFilesFromMessage(lastMessage);

      // Lazily allocate a conversation id (persisted Assist mode only). Resumes
      // reuse the id the paused turn was started with.
      const conversationId = isApprovalResume
        ? (lastServerConversationId ?? (await getConversationId(false)))
        : await getConversationId(!isTempChat);

      // A resume needs the exact conversation whose pause is being decided.
      // Without it (e.g. a temporary chat reloaded before its first frame)
      // there is nothing to POST against, so explain and end the run instead
      // of firing the approvals request with an empty id. The server clears
      // its stale pause when the next message arrives.
      if (isApprovalResume && !conversationId) {
        yield {
          content: [
            ...((currentAssistantMessage?.content ?? []).map((part) => ({ ...part })) as any[]),
            {
              type: "text",
              text: "This paused request could not be resumed because its conversation is no longer available. Please send the request again.",
            },
          ],
        };
        return;
      }

      // Shared frame → content-parts builder (also used to rehydrate history).
      // Approval ids already on the message are skipped so a resume does not
      // duplicate the paused card with the executed call's result frame.
      const builder = createContentPartsBuilder({
        skipToolCallIds: approvalToolCallIds,
      });
      let lastYieldedSnapshot = "";

      // Yield the current content parts so @assistant-ui/react re-renders the
      // assistant message incrementally while the SSE stream is still open.
      const maybeYield = function* () {
        const currentSnapshot = JSON.stringify(builder.parts);
        if (currentSnapshot === lastYieldedSnapshot) return;
        lastYieldedSnapshot = currentSnapshot;
        yield { content: builder.parts.map((part) => ({ ...part })) as any[] };
      };

      // Processes normalized SSE frames into the assistant message content.
      // Shared by regular completions and approval resumes.
      async function* processFrames(frames: AsyncGenerator<string>) {
        for await (const rawPayload of frames) {
          let frame: any;
          try {
            frame = JSON.parse(rawPayload);
          } catch {
            continue;
          }

          // Keep the server-allocated conversation id (temporary chats never
          // allocate one client-side) so a paused approval can be resumed.
          if (typeof frame?.conversation_id === "string" && frame.conversation_id) {
            lastServerConversationId = frame.conversation_id;
          }

          // Follow-up suggestions are transport-level, not message content.
          if (frame?.type === "followup" && Array.isArray(frame.output)) {
            onSuggestionsUpdate?.(frame.output as string[]);
          }

          if (frame?.type === "delta" && typeof frame.output === "string" && frame.output) {
            onTextDelta?.(frame.output);
          }

          builder.apply(frame);
          yield* maybeYield();
        }
      }

      try {
        if (isApprovalResume) {
          // Every resolved approval was already sent (a stray continuation):
          // keep the paused turn as-is instead of resuming with no decisions,
          // which the server would treat as a full denial.
          if (approvalDecisions.length === 0) return;
          for (const decision of approvalDecisions) {
            submittedApprovalIds.add(decision.toolCallId);
          }
          yield* processFrames(
            streamApprovalDecisions(
              {
                flowVersionId,
                conversationId: conversationId ?? "",
                isTempChat,
                decisions: approvalDecisions,
              },
              options.abortSignal,
              getExtraHeaders?.(),
            ),
          );
        } else {
          yield* processFrames(
            streamChatCompletion(
              {
                flowVersionId,
                conversationId: conversationId || null,
                threadMessages,
                userInput: userInputText,
                files: files.length > 0 ? files : undefined,
                isTempChat,
              },
              options.abortSignal,
              getExtraHeaders?.(),
            ),
          );
        }

        // Ensure at least a placeholder is rendered.
        if (builder.isEmpty()) {
          builder.pushText("Workflow completed successfully.");
        }

        // Unresolved approvals must leave the message in "requires-action": the
        // runtime only accepts approval responses (and auto-continues once the
        // whole batch is decided) from that state.
        if (builder.hasPendingApproval()) {
          yield {
            content: builder.parts as any[],
            status: { type: "requires-action", reason: "tool-calls" },
          };
        } else {
          yield { content: builder.parts as any[] };
        }
        onRequestComplete?.();
      } catch (error) {
        console.error("Streaming chat error:", error);
        // Keep everything already streamed (text, reasoning, tool cards) —
        // replacing the message with only the error would hide the turn's
        // context. Gates still undecided can no longer be resumed (the stream
        // died), so mark them "expired": the card drops its buttons, the
        // coordinator unregisters it, and the message finishes instead of
        // sitting in "requires-action" forever.
        for (const part of builder.parts) {
          if (isPendingApprovalPart(part)) {
            part.approval = { ...part.approval, resolution: "expired" };
          }
        }
        const note =
          error instanceof Error ? error.message : "An error occurred during the chat request.";
        if (builder.isEmpty()) {
          builder.pushText(note);
        } else {
          builder.pushText(`\n\n${note}`);
        }
        yield { content: builder.parts.map((part) => ({ ...part })) as any[] };
      } finally {
        onRunFinished?.();
      }
    },
  };
};
