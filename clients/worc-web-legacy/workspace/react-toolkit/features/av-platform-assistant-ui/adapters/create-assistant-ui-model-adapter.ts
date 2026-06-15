/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ChatModelAdapter,
  ThreadMessage,
  ThreadUserMessagePart,
} from "@assistant-ui/react";

import { executeFlowOnWeb } from "../apis/execute-flow-apis";
import { ExecuteFlowRequestDto } from "../dtos/execute-flow-request-dto";
import { ExecuteFlowResponseDto } from "../dtos/execute-flow-response-dto";
import { LLMMessageType } from "../types/llm-message.type";

type CreateAssistantUIModelAdapterParams = {
  flowVersionId: string;
  // Accepts the lazy getter instead of a static string
  getConversationId: (
    allocateIfMissing: boolean,
  ) => Promise<string | undefined>;
  onRequestComplete?: () => void;
  onSuggestionsUpdate?: (actions: string[]) => void;
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
          const resultStr =
            typeof p.result === "string" ? p.result : JSON.stringify(p.result);
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
function mapThreadToLLMMessages(
  messages: readonly ThreadMessage[],
): LLMMessageType[] {
  return messages
    .filter(
      (msg) =>
        msg.role === "user" ||
        msg.role === "assistant" ||
        msg.role === "system",
    )
    .map((msg) => ({
      role: msg.role as LLMMessageType["role"],
      content: toMessageText(msg.content),
    }))
    .filter((msg) => msg.content.trim().length > 0);
}

/**
 * Parses `outputDataJson` to support text, tool calls, and follow-ups.
 */
export const createAssistantUIModelAdapter = ({
  flowVersionId,
  getConversationId,
  onRequestComplete,
  onSuggestionsUpdate,
}: CreateAssistantUIModelAdapterParams): ChatModelAdapter => {
  return {
    async *run(options) {
      const allMessagesExceptLast = options.messages.slice(0, -1);
      const threadMessages = mapThreadToLLMMessages(allMessagesExceptLast);

      const lastMessage = options.messages[options.messages.length - 1];
      const userInputText = lastMessage
        ? toMessageText(lastMessage.content)
        : "";

      // If we don't have an conversation ID yet, this guarantees one is created right before executing.
      const conversationId = await getConversationId(true);

      const inputArguments = {
        triggeredBy: "chat",
        threadMessages: threadMessages,
        userInput: userInputText,
        conversationId: conversationId || undefined,
      };

      const request: ExecuteFlowRequestDto = {
        flowVersionId,
        InputArgumentsJson: JSON.stringify(inputArguments),
        waitForCompletion: true,
      };

      try {
        const response = await executeFlowOnWeb(request);
        const data = response.data as ExecuteFlowResponseDto;

        const rawOutput = data?.outputDataJson;

        let parsedOutput: any = rawOutput;

        if (typeof rawOutput === "string") {
          try {
            parsedOutput = JSON.parse(rawOutput);
          } catch {
            parsedOutput = { text: rawOutput };
          }
        }

        const contentParts: any[] = [];

        if (
          parsedOutput &&
          typeof parsedOutput === "object" &&
          !Array.isArray(parsedOutput)
        ) {
          if (parsedOutput.text) {
            contentParts.push({ type: "text", text: parsedOutput.text });
          }

          if (
            Array.isArray(parsedOutput.tools) &&
            parsedOutput.tools.length > 0
          ) {
            parsedOutput.tools.forEach((tool: any) => {
              contentParts.push({
                type: "tool-call",
                toolCallId: tool.call_id,
                toolName: tool.output?.action || tool.type,
                argsText: JSON.stringify(tool.output || {}),
                args: tool.output || {},
              });
            });
          }

          if (Array.isArray(parsedOutput.recommended_actions)) {
            onSuggestionsUpdate?.(parsedOutput.recommended_actions);
          }
        } else {
          contentParts.push({
            type: "text",
            text: String(parsedOutput || "Workflow completed successfully."),
          });
        }

        yield { content: contentParts };

        // Triggers the callback passed via props (to refresh credits)
        onRequestComplete?.();
      } catch (error) {
        console.error("Execute Flow API Error:", error);
        yield {
          content: [
            {
              type: "text",
              text: "An error occurred during workflow execution.",
            },
          ],
        };
      }
    },
  };
};
