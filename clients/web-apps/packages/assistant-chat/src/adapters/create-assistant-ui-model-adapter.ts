/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChatModelAdapter, ThreadMessage, ThreadUserMessagePart } from "@assistant-ui/react";

import { streamApprovalDecisions, streamChatCompletion } from "../apis/streaming-chat-apis";
import { isPendingApprovalPart } from "../lib/approval-parts";
import { LLMMessageType } from "../types/llm-message.type";

export type CreateAssistantUIModelAdapterParams = {
  flowVersionId: string;
  // Accepts the lazy getter instead of a static string
  getConversationId: (allocateIfMissing: boolean) => Promise<string | undefined>;
  onRequestComplete?: () => void;
  onSuggestionsUpdate?: (actions: string[]) => void;
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

      const contentParts: any[] = [];
      const toolAccumulator: Record<string, any> = {};
      let hasTextContent = false;
      let lastYieldedSnapshot = "";
      // Genuine reasoning/thinking tokens emitted by the model.
      let reasoningText = "";

      const pushText = (text: string) => {
        const last = contentParts[contentParts.length - 1];
        if (last && last.type === "text") {
          last.text += text;
        } else {
          contentParts.push({ type: "text", text });
        }
        hasTextContent ||= text.trim().length > 0;
      };

      // Keep streamed reasoning in a single reasoning part so assistant-ui's
      // native chain-of-thought grouping renders it as one block.
      const setReasoningPart = () => {
        const idx = contentParts.findIndex((p) => p.type === "reasoning");
        if (idx !== -1) contentParts[idx].text = reasoningText;
        else contentParts.push({ type: "reasoning", text: reasoningText });
      };

      // Yield the current content parts so @assistant-ui/react re-renders the
      // assistant message incrementally while the SSE stream is still open.
      const maybeYield = function* () {
        const currentSnapshot = JSON.stringify(contentParts);
        if (currentSnapshot === lastYieldedSnapshot) return;
        lastYieldedSnapshot = currentSnapshot;
        yield { content: contentParts.map((part) => ({ ...part })) };
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

          switch (frame?.type) {
            case "reasoning": {
              // Genuine thinking/reasoning tokens emitted by the model.
              const reasoning = typeof frame.output === "string" ? frame.output : "";
              if (reasoning) {
                reasoningText += reasoning;
                setReasoningPart();
                yield* maybeYield();
              }
              break;
            }
            case "delta": {
              const text = typeof frame.output === "string" ? frame.output : "";
              if (text) {
                pushText(text);
                // The response is being surfaced — the chain-of-thought part
                // remains visible above the text.
                yield* maybeYield();
              }
              break;
            }
            case "tool_call": {
              // A tool-call frame is emitted twice: a preliminary frame when
              // the tools node starts (no `content`) and a completion frame
              // with the result. Upsert by id so the card transitions
              // running → done while keeping the name/args from the start
              // frame when a completion frame omits them.
              const toolCallId =
                frame.output?.tool_call_id || `tool-${Object.keys(toolAccumulator).length}`;
              // Executed approval actions already have a card with this id.
              if (approvalToolCallIds.has(toolCallId)) break;
              const frameName = typeof frame.output?.name === "string" ? frame.output.name : "";
              const frameArgs = frame.output?.args;
              const hasResult =
                frame.output?.content !== undefined && frame.output?.content !== null;
              const isError = frame.output?.status === "error";

              const existing = toolAccumulator[toolCallId];
              if (existing) {
                if (hasResult) {
                  if (frameName) existing.toolName = frameName;
                  if (frameArgs && Object.keys(frameArgs).length > 0) {
                    existing.args = frameArgs;
                    existing.argsText = JSON.stringify(frameArgs);
                  }
                  existing.result = frame.output.content;
                  if (isError) existing.isError = true;
                  delete existing.isPreliminary;
                  yield* maybeYield();
                }
              } else {
                const args = frameArgs ?? frame.output ?? {};
                const argsText =
                  typeof frame.output?.content === "string" && !frameArgs
                    ? frame.output.content
                    : JSON.stringify(args);
                const part: any = {
                  type: "tool-call",
                  toolCallId,
                  toolName: frameName || "tool",
                  argsText,
                  args,
                  ...(hasResult
                    ? {
                        result: frame.output.content,
                        ...(isError ? { isError: true } : {}),
                      }
                    : { isPreliminary: true }),
                };
                toolAccumulator[toolCallId] = part;
                contentParts.push(part);
                yield* maybeYield();
              }
              break;
            }
            case "approval_required": {
              // The server paused before executing human-approval actions.
              // Render a gated tool-call part; the user's decision re-runs this
              // adapter, which resumes the paused turn via the approvals API.
              const toolCallId = frame.output?.tool_call_id || `approval-${contentParts.length}`;
              const toolName = frame.output?.name || "tool";
              const args = frame.output?.args || {};
              // An approval bag marks the gate as undecided. Its `id` is
              // required: the runtime addresses a gate by `approval.id`, so a
              // shared/absent id makes a second gate in the same message
              // resolve to the first (already decided) one. The runtime fills
              // in `approved`/`reason` on a user decision; the adapter sets
              // `resolution: "expired"` when the pause can no longer be
              // resumed. The tools node emits a preliminary frame before
              // pausing, so gate that part in place instead of appending a
              // duplicate card for the same tool_call_id.
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
                const part: any = {
                  type: "tool-call",
                  toolCallId,
                  toolName,
                  argsText: JSON.stringify(args),
                  args,
                  approval: { id: toolCallId },
                };
                toolAccumulator[toolCallId] = part;
                contentParts.push(part);
              }
              yield* maybeYield();
              break;
            }
            case "skill": {
              // Surface skill selection as a native data part so the UI can
              // render it inside the chain-of-thought group.
              const skillName = frame.output?.name || frame.output;
              if (skillName) {
                contentParts.push({
                  type: "data",
                  name: "skill",
                  data: { name: skillName },
                });
                yield* maybeYield();
              }
              break;
            }
            case "tools": {
              // Final list of tool results — merge into emitted tool-call parts.
              if (Array.isArray(frame.output)) {
                const toolResults = frame.output as any[];
                toolResults.forEach((tool, idx) => {
                  const id = tool?.call_id || `tool-${idx}`;
                  // Executed approval actions already have a card with this id.
                  if (approvalToolCallIds.has(id)) return;
                  const existing = toolAccumulator[id];
                  const name = tool?.output?.action || tool?.type || "tool";
                  if (existing) {
                    existing.toolName = name;
                    existing.args = tool?.output || existing.args;
                    existing.argsText = JSON.stringify(tool?.output || {});
                    existing.result = tool?.output || tool;
                    delete existing.isPreliminary;
                  } else {
                    contentParts.push({
                      type: "tool-call",
                      toolCallId: id,
                      toolName: name,
                      argsText: JSON.stringify(tool?.output || {}),
                      args: tool?.output || {},
                      result: tool?.output || tool,
                    });
                  }
                });
                yield* maybeYield();
              }
              break;
            }
            case "followup": {
              if (Array.isArray(frame.output)) {
                onSuggestionsUpdate?.(frame.output as string[]);
              }
              break;
            }
            case "done": {
              // Only use the done frame as a fallback if no token deltas were
              // already streamed; otherwise it duplicates the final message.
              const text = typeof frame.output === "string" ? frame.output : "";
              if (text && !hasTextContent) pushText(text);
              break;
            }
            case "error": {
              // Normalized error frames carry the detail in `output`; `message`
              // is kept as a fallback for older relays.
              const detail =
                typeof frame?.message === "string" && frame.message
                  ? frame.message
                  : typeof frame?.output === "string"
                    ? frame.output
                    : "";
              pushText(detail || "An error occurred during the request.");
              break;
            }
            default:
              break;
          }
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
        if (contentParts.length === 0) {
          contentParts.push({
            type: "text",
            text: "Workflow completed successfully.",
          });
        }

        // Unresolved approvals must leave the message in "requires-action": the
        // runtime only accepts approval responses (and auto-continues once the
        // whole batch is decided) from that state.
        const hasPendingApproval = contentParts.some(isPendingApprovalPart);

        if (hasPendingApproval) {
          yield {
            content: contentParts,
            status: { type: "requires-action", reason: "tool-calls" },
          };
        } else {
          yield { content: contentParts };
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
        for (const part of contentParts) {
          if (isPendingApprovalPart(part)) {
            part.approval = { ...part.approval, resolution: "expired" };
          }
        }
        const note =
          error instanceof Error ? error.message : "An error occurred during the chat request.";
        if (contentParts.length === 0) {
          contentParts.push({ type: "text", text: note });
        } else {
          pushText(`\n\n${note}`);
        }
        yield { content: contentParts.map((part) => ({ ...part })) };
      }
    },
  };
};
