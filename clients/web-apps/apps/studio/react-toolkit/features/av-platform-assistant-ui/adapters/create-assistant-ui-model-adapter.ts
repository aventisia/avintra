/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChatModelAdapter, ThreadMessage, ThreadUserMessagePart } from "@assistant-ui/react";

import { streamChatCompletion } from "../apis/streaming-chat-apis";
import { LLMMessageType } from "../types/llm-message.type";

type CreateAssistantUIModelAdapterParams = {
  flowVersionId: string;
  // Accepts the lazy getter instead of a static string
  getConversationId: (allocateIfMissing: boolean) => Promise<string | undefined>;
  onRequestComplete?: () => void;
  onSuggestionsUpdate?: (actions: string[]) => void;
  /** When true, the conversation is kept in-memory only (Studio test panel). */
  isTempChat?: boolean;
};

/**
 * Translates rich UI message state into a plain string log.
 */
const toMessageText = (
  content: readonly ThreadUserMessagePart[] | ThreadMessage["content"],
): string => {
  return content
    .map((part) => {
      if (part.type === "text" || part.type === "reasoning") return part.text;

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
 * Streams the chat completion from the normalized llmpipeline endpoint and
 * emits incremental text deltas, tool calls, follow-ups, and the final result.
 *
 * The server (WorkspaceAPIs -> llmpipeline /chat/completions/normalized) sends
 * SSE frames of shape:
 *   { type: "delta",      output: "<partial text>" }
 *   { type: "tool_call",  output: { tool_call_id, content } }
 *   { type: "tools",      output: [ { action, ... } ] }
 *   { type: "followup",   output: [ "suggestion", ... ] }
 *   { type: "done",       output: "<final text>" }
 */
export const createAssistantUIModelAdapter = ({
  flowVersionId,
  getConversationId,
  onRequestComplete,
  onSuggestionsUpdate,
  isTempChat = false,
}: CreateAssistantUIModelAdapterParams): ChatModelAdapter => {
  return {
    async *run(options) {
      const allMessagesExceptLast = options.messages.slice(0, -1);
      const threadMessages = mapThreadToLLMMessages(allMessagesExceptLast);

      const lastMessage = options.messages[options.messages.length - 1];
      const userInputText = lastMessage ? toMessageText(lastMessage.content) : "";
      const files = extractFilesFromMessage(lastMessage);

      // Lazily allocate a conversation id (persisted Assist mode only).
      const conversationId = await getConversationId(!isTempChat);

      const contentParts: any[] = [];
      const toolAccumulator: Record<string, any> = {};
      let hasTextContent = false;

      const pushText = (text: string) => {
        const last = contentParts[contentParts.length - 1];
        if (last && last.type === "text") {
          last.text += text;
        } else {
          contentParts.push({ type: "text", text });
        }
        hasTextContent ||= text.trim().length > 0;
      };

      try {
        for await (const rawPayload of streamChatCompletion(
          {
            flowVersionId,
            conversationId: conversationId || null,
            threadMessages,
            userInput: userInputText,
            files: files.length > 0 ? files : undefined,
            isTempChat,
          },
          options.abortSignal,
        )) {
          let frame: any;
          try {
            frame = JSON.parse(rawPayload);
          } catch {
            continue;
          }

          switch (frame?.type) {
            case "delta": {
              const text = typeof frame.output === "string" ? frame.output : "";
              if (text) pushText(text);
              break;
            }
            case "tool_call": {
              // Emit a tool-call part with the args + result so the UI can render
              // the tool widget (completed state with the tool's output).
              const toolCallId =
                frame.output?.tool_call_id || `tool-${Object.keys(toolAccumulator).length}`;
              const toolName = frame.output?.name || "tool";
              const args = frame.output?.args || frame.output || {};
              const argsText =
                typeof frame.output?.content === "string" && !frame.output?.args
                  ? frame.output.content
                  : JSON.stringify(args);
              const part = {
                type: "tool-call",
                toolCallId,
                toolName,
                argsText,
                args,
                result: frame.output?.content,
              };
              toolAccumulator[toolCallId] = part;
              contentParts.push(part);
              break;
            }
            case "skill": {
              // Surface skill usage as a lightweight system note so the user
              // can see which skills the agent invoked.
              const skillName = frame.output?.name || frame.output;
              if (skillName) {
                pushText(`\n\n> Using skill: **${skillName}**\n`);
              }
              break;
            }
            case "tools": {
              // Final list of tool results — merge into emitted tool-call parts.
              if (Array.isArray(frame.output)) {
                const toolResults = frame.output as any[];
                toolResults.forEach((tool, idx) => {
                  const id = tool?.call_id || `tool-${idx}`;
                  const existing = toolAccumulator[id];
                  const name = tool?.output?.action || tool?.type || "tool";
                  if (existing) {
                    existing.toolName = name;
                    existing.args = tool?.output || existing.args;
                    existing.argsText = JSON.stringify(tool?.output || {});
                    existing.result = tool?.output || tool;
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
              pushText(frame?.message || "An error occurred during the request.");
              break;
            }
            // Backend metadata frames that should not be rendered.
            case "tool_names":
            case "skill_names":
              break;
            default:
              break;
          }
        }

        // Ensure at least a placeholder is rendered.
        if (contentParts.length === 0) {
          contentParts.push({
            type: "text",
            text: "Workflow completed successfully.",
          });
        }

        yield { content: contentParts };
        onRequestComplete?.();
      } catch (error) {
        console.error("Streaming chat error:", error);
        yield {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : "An error occurred during the chat request.",
            },
          ],
        };
      }
    },
  };
};
