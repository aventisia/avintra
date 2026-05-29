/* eslint-disable @typescript-eslint/no-explicit-any */
import { FlowTypesEnum } from "@/react-toolkit/enums/flow-types-enum";

import { ChatModelAdapter, ThreadMessage } from "@assistant-ui/react";

import { LLMMessageType, LLMProviderType, LLMRequestDto } from "..";
import { streamLLMGenerate } from "../apis/assistant-ui-stream.api";
import { LLMToolsOutputDto } from "../dtos/llm-response.dto";

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
 * Narrows an unknown value to `LLMToolsOutputDto[]`.
 *
 * Checks for both `call_id` (required) and `type` (required by the DTO) so
 * that an arbitrary JSON array that happens to have a `call_id` on its first
 * element is not misidentified as a tool-call response.
 */
function isToolCallResponse(value: unknown): value is LLMToolsOutputDto[] {
  if (!Array.isArray(value) || value.length === 0) return false;
  const first = value[0] as Record<string, unknown>;
  return (
    typeof first?.call_id === "string" &&
    first.call_id.length > 0 &&
    typeof first?.type === "string"
  );
}

// Message mapper
const mapThreadToLLMMessagesAndFiles = (
  messages: readonly ThreadMessage[],
): { mappedMessages: LLMMessageType[]; files: string[] } => {
  const files: string[] = [];

  const mappedMessages = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((message) => {
      let textContent = "";

      message.content.forEach((part) => {
        if (part.type === "text" || part.type === "reasoning") {
          textContent += part.text + "\n";
        }

        if (part.type === "image") {
          const p = part as any;
          if (p.image) files.push(p.image);
          else if (p.url) files.push(p.url);
        }

        if (part.type === "file") {
          const p = part as any;
          if (p.url) files.push(p.url);
          else if (p.data) files.push(p.data);
          else if (p.file?.url) files.push(p.file.url);
        }

        if (part.type === "tool-call") {
          const p = part as any;
          textContent += `\n[Tool Call: ${p.toolName}]\nArgs: ${p.argsText}\n`;
          if (p.result) {
            const resultStr =
              typeof p.result === "string"
                ? p.result
                : JSON.stringify(p.result);
            textContent += `\n[System Environment Response to ${p.toolName}]\nResult: ${resultStr}\n`;
          }
        }
      });

      return { role: message.role, content: textContent.trim() };
    })
    .filter((m) => m.content.trim().length > 0);

  return { mappedMessages, files };
};

// Adapter
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
      const { mappedMessages, files } = mapThreadToLLMMessagesAndFiles(
        options.messages,
      );

      const systemPrompt =
        typeof agentConfig?.input === "string" ? agentConfig.input.trim() : "";
      const normalizedPolicyContext = policyContext?.trim();

      const systemMessages: LLMMessageType[] = [
        ...(systemPrompt
          ? [{ role: "system" as const, content: systemPrompt }]
          : []),
        ...(normalizedPolicyContext
          ? [{ role: "system" as const, content: normalizedPolicyContext }]
          : []),
      ];

      const input = [...systemMessages, ...mappedMessages];
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
        files: [...(agentConfig?.files || []), ...files],
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
        let rawResponse: unknown = "";

        for await (const response of streamLLMGenerate({
          request,
          signal: options.abortSignal,
        })) {
          rawResponse = response ?? "";
        }

        // The API may return either a JSON string that encodes the tool array,
        // or the array itself (when streamLLMGenerate already parsed it).
        // Normalise to a plain value before running the type guard.
        let parsed: unknown = rawResponse;
        if (typeof rawResponse === "string") {
          try {
            parsed = JSON.parse(rawResponse);
          } catch {
            // Not JSON — treat as plain text below.
            parsed = rawResponse;
          }
        }

        if (isToolCallResponse(parsed)) {
          const toolParts = parsed.map((tool) => ({
            type: "tool-call" as const,
            toolCallId: tool.call_id,
            toolName: tool.output?.action || tool.type,
            argsText: JSON.stringify(tool.output || {}),
            args: tool.output || {},
          }));
          yield { content: toolParts as any };
          onRequestComplete?.();
          return;
        }

        // Fallback: plain text response on the non-streaming path.
        yield { content: [{ type: "text", text: String(rawResponse) }] };
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
        // Each chunk is either the full accumulated text so far (replace) or an
        // incremental addition (append). Detect which case we're in by checking
        // whether the new chunk begins with what we already have.
        accumulatedText =
          typeof chunkText === "string" && chunkText.startsWith(accumulatedText)
            ? chunkText
            : accumulatedText + (chunkText ?? "");

        yield { content: [{ type: "text", text: accumulatedText }] };
      }

      onRequestComplete?.();
    },
  };
};
