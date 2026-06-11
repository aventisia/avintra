/* eslint-disable @typescript-eslint/no-explicit-any */
import { FlowTypesEnum } from "@/react-toolkit/enums/flow-types-enum";

import { ChatModelAdapter, ThreadMessage } from "@assistant-ui/react";

import { LLMMessageType, LLMProviderType, LLMRequestDto } from "..";
import { streamLLMGenerate } from "../apis/assistant-ui-stream.api";
import { LLMOutputDto, LLMToolsOutputDto } from "../dtos/llm-response.dto";

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
  // Callback to get recommended actions back to suggestions adaptor
  onSuggestionsUpdate: (actions: string[]) => void;
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
  onSuggestionsUpdate,
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
        is_chat_agent: true, // Enable for chat agent
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

        // Handle LLMOutputDto chat agent format
        if (
          typeof parsed === "object" &&
          parsed !== null &&
          !Array.isArray(parsed)
        ) {
          const chatOutput = parsed as LLMOutputDto;
          const contentParts: any[] = [];

          if (chatOutput.text) {
            contentParts.push({ type: "text", text: chatOutput.text });
          }

          if (Array.isArray(chatOutput.tools) && chatOutput.tools.length > 0) {
            const toolParts = chatOutput.tools.map((tool: any) => ({
              type: "tool-call",
              toolCallId: tool.call_id,
              toolName: tool.output?.action || tool.type,
              argsText: JSON.stringify(tool.output || {}),
              args: tool.output || {},
            }));
            contentParts.push(...toolParts);
          }

          if (chatOutput?.recommended_actions) {
            onSuggestionsUpdate(chatOutput.recommended_actions);
          }

          if (contentParts.length > 0) {
            yield { content: contentParts };
            onRequestComplete?.();
            return;
          }
        }

        // Fallback: array of tools
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

      for await (const chunk of streamLLMGenerate({
        request,
        signal: options.abortSignal,
      })) {
        // If the backend sends the fully parsed object directly in the chunk
        if (typeof chunk === "object" && chunk !== null) {
          const chatOutput = chunk as any;
          const contentParts: any[] = [];

          if (chatOutput.text) {
            accumulatedText = chatOutput.text;
            contentParts.push({ type: "text", text: accumulatedText });
          }

          if (Array.isArray(chatOutput.tools) && chatOutput.tools.length > 0) {
            chatOutput.tools.forEach((t: any) => {
              contentParts.push({
                type: "tool-call",
                toolCallId: t.call_id,
                toolName: t.output?.action || t.type,
                argsText: JSON.stringify(t.output || {}),
                args: t.output || {},
              });
            });
          }

          if (chatOutput.recommended_actions) {
            onSuggestionsUpdate(chatOutput.recommended_actions);
          }

          if (contentParts.length > 0) {
            yield { content: contentParts };
          }
        } else {
          // If the backend streams strings (which might be raw text or stringified JSON)
          accumulatedText =
            typeof chunk === "string" &&
            (chunk as string)?.startsWith(accumulatedText)
              ? chunk
              : accumulatedText + (chunk ?? "");

          try {
            // Attempt to parse stringified JSON on the fly
            const parsed = JSON.parse(accumulatedText);
            const contentParts: any[] = [];

            if (parsed.text) {
              contentParts.push({ type: "text", text: parsed.text });
            }

            if (Array.isArray(parsed.tools) && parsed.tools.length > 0) {
              parsed.tools.forEach((t: any) => {
                contentParts.push({
                  type: "tool-call",
                  toolCallId: t.call_id,
                  toolName: t.output?.action || t.type,
                  argsText: JSON.stringify(t.output || {}),
                  args: t.output || {},
                });
              });
            }

            if (parsed.recommended_actions) {
              onSuggestionsUpdate(parsed.recommended_actions);
            }

            yield {
              content:
                contentParts.length > 0
                  ? contentParts
                  : [{ type: "text", text: accumulatedText }],
            };
          } catch {
            // Plain text stream fallback
            yield { content: [{ type: "text", text: accumulatedText }] };
          }
        }
      }

      onRequestComplete?.();
    },
  };
};
