import { FlowTypesEnum } from "@/react-toolkit/enums/flow-types-enum";

import {
  ChatModelAdapter,
  ThreadMessage,
  ThreadUserMessagePart,
} from "@assistant-ui/react";

import { LLMMessageType, LLMProviderType, LLMRequestDto } from "..";
import { streamLLMGenerate } from "../apis/assistant-ui-stream.api";

/**
 * Inputs required to construct the Assistant UI chat model adapter.
 * These values are forwarded to the llm generate request metadata.
 */
type CreateAssistantUIModelAdapterParams = {
  provider: LLMProviderType;
  model: string;
  flowVersionId: string;
  flowName: string;
  agentConfig?: Partial<LLMRequestDto>;
  policyContext?: string;
  onRequestComplete?: () => void;
};

/**
 * Flattens assistant-ui message parts into a plain text payload expected
 * by the backend LLM request contract.
 */
const toMessageText = (
  content: readonly ThreadUserMessagePart[] | ThreadMessage["content"],
) => {
  return content
    .map((part) => {
      if (part.type === "text" || part.type === "reasoning") return part.text;
      if (part.type === "source") return part.url;
      if (part.type === "data") return JSON.stringify(part.data);
      if (part.type === "tool-call") return part.argsText;
      return "";
    })
    .filter(Boolean)
    .join("\n\n");
};

/**
 * Converts thread messages to the API message shape and drops empty entries.
 */
const mapThreadToLLMMessages = (
  messages: readonly ThreadMessage[],
): LLMMessageType[] => {
  return messages
    .filter(
      (message) => message.role === "user" || message.role === "assistant",
    )
    .map((message) => ({
      role: message.role,
      content: toMessageText(message.content),
    }))
    .filter((message) => message.content.trim().length > 0);
};

/**
 * Creates a ChatModelAdapter for @assistant-ui/react.
 * The adapter maps thread history to the llm request DTO
 * and streams chunks back as assistant-ui text parts.
 */
export const createAssistantUIModelAdapter = ({
  provider,
  model,
  flowVersionId,
  flowName,
  agentConfig,
  policyContext,
  onRequestComplete,
}: CreateAssistantUIModelAdapterParams): ChatModelAdapter => {
  return {
    /**
     * Called by assistant-ui for each user turn.
     * Yields incremental text chunks to render
     * streaming assistant output.
     */
    async *run(options) {
      const threadMessages = mapThreadToLLMMessages(options.messages);

      const systemPrompt =
        typeof agentConfig?.input === "string" ? agentConfig.input.trim() : "";

      const normalizedPolicyContext = policyContext?.trim();

      const systemMessages: LLMMessageType[] = [
        ...(systemPrompt
          ? [
              {
                role: "system" as const,
                content: systemPrompt,
              },
            ]
          : []),

        ...(normalizedPolicyContext
          ? [
              {
                role: "system" as const,
                content: normalizedPolicyContext,
              },
            ]
          : []),
      ];

      const input = [...systemMessages, ...threadMessages];

      /**
       * Tool execution currently
       * requires non-stream mode.
       */
      const hasTools = !!agentConfig?.tool_config?.length;

      const shouldStream = !hasTools;

      const request: LLMRequestDto = {
        ...agentConfig,

        provider: agentConfig?.provider ?? provider,

        model: agentConfig?.model ?? model,

        input,

        stream: shouldStream,

        ref_type: FlowTypesEnum.ChatAgent,

        ref_id: flowVersionId || "chat-agent-flow",

        ref_name: flowName || "Chat Agent",

        action: "AgentExecution",
      } as LLMRequestDto;

      /**
       * Non-stream mode
       * Used for tools execution.
       */
      if (!shouldStream) {
        let finalResponse = "";

        for await (const response of streamLLMGenerate({
          request,
          signal: options.abortSignal,
        })) {
          finalResponse = response ?? "";
        }

        yield {
          content: [
            {
              type: "text",
              text: finalResponse,
            },
          ],
        };

        onRequestComplete?.();
        return;
      }

      /**
       * Stream mode
       * Used for standard chat.
       */
      let accumulatedText = "";

      for await (const chunkText of streamLLMGenerate({
        request,
        signal: options.abortSignal,
      })) {
        // Backend may stream either delta tokens or cumulative snapshots.
        // Emit a cumulative value so assistant-ui renders progressive text.
        accumulatedText = chunkText.startsWith(accumulatedText)
          ? chunkText
          : accumulatedText + chunkText;

        yield {
          content: [
            {
              type: "text",
              text: accumulatedText,
            },
          ],
        };
      }

      onRequestComplete?.();
    },
  };
};
