import { toast } from "@avplatform/ui/sonner";
import { useShallow } from "zustand/react/shallow";

import {
  LLMMessageDto,
  LLMRequestDto,
  ProviderLiteral,
  ToolConfigDto,
} from "@/features/dynamic-config-panel/dtos/llm-providers-dto";
import { useExecuteModelMutation } from "@/features/dynamic-config-panel/hooks/useExecuteModelMutation";
import { filesToDataUrls } from "@/features/dynamic-config-panel/utils/file-to-data-url";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

import {
  getKBConfig,
  getModelConfig,
  getSuggestionsConfig,
  getToolsConfig,
} from "../../utils/ai-node-config-helper";
import { useResetOnTestTabOpen } from "./useResetOnTestTabOpen";

/**
 * Builds the input payload for an LLM request.
 *
 * Returns the base system prompt as a plain string when no follow-up or
 * user prompt is provided. Otherwise returns an ordered message array:
 *
 * 1. Base system prompt (`system`)
 * 2. Follow-up prompt (`system`) if provided
 * 3. User prompt (`user`) if provided
 *
 * Message order is important because it influences model behavior,
 * particularly for follow-up instructions.
 *
 * @param baseSystemPrompt Primary system instructions.
 * @param userPrompt Optional user message.
 * @param followUpPrompt Optional additional system instructions.
 *
 * @returns A plain prompt string or an ordered `LLMMessageDto[]`.
 */

export function buildLLMInput(
  baseSystemPrompt: string,
  userPrompt: string,
  followUpPrompt?: string,
): string | LLMMessageDto[] {
  const trimmedUserPrompt = userPrompt.trim();
  const trimmedFollowUpPrompt = followUpPrompt?.trim();

  if (!trimmedUserPrompt && !trimmedFollowUpPrompt) return baseSystemPrompt;

  /**
   * Note: Message order affects model behavior.
   * The base system prompt must appear before the follow-up prompt so that
   * follow-up instructions extend or refine the original behavior rather than
   * replacing its context.
   */

  const messages = [
    {
      role: "system",
      content: baseSystemPrompt,
    },
  ];

  if (trimmedFollowUpPrompt) {
    messages.push({ role: "system", content: trimmedFollowUpPrompt });
  }

  if (trimmedUserPrompt) {
    messages.push({ role: "user", content: trimmedUserPrompt });
  }

  return messages as unknown as LLMMessageDto[];
}

export function useLLMExecute(
  formData: Record<string, unknown>,
  files: File[],
  nodeUniqueName?: string,
) {
  const { currentFlow } = useCurrentFlowStore(
    useShallow((state) => ({ currentFlow: state.currentFlow })),
  );
  const mutation = useExecuteModelMutation();
  useResetOnTestTabOpen(mutation.reset);
  const isConversationAgent = nodeUniqueName === "CreateConversationAIAgent";

  /**
   * Builds the exact payload that would be sent to the LLM request.
   *
   * Exposed separately from `execute` (rather than inlined in the mutate
   * call) so the Test tab can render this same payload as a live preview
   * before the user hits Execute — keeping preview and actual request in
   * lockstep instead of two logic paths that can drift apart.
   */
  async function buildPayload(userPrompt: string): Promise<LLMRequestDto | null> {
    const promptKey = Object.keys(formData).find((k) => k.includes("__Prompt__"));
    const systemPrompt = promptKey ? (formData[promptKey] as string) : "";

    const modelConfigData = getModelConfig(formData);
    if (!modelConfigData) {
      toast.error("Model configuration is missing");
      return null;
    }
    const { config: modelConfig } = modelConfigData;

    const kbConfigData = getKBConfig(formData);

    const dataUrlFiles = files.length > 0 ? await filesToDataUrls(files) : undefined;

    const toolsConfigData = getToolsConfig(formData);
    const suggestionsConfigData = getSuggestionsConfig(formData);
    const hasToolConfig = Boolean(toolsConfigData?.config?.length);
    const dynamicActionsEnabled = Boolean(suggestionsConfigData?.config?.enableDynamicActions);
    const followUpPrompt = dynamicActionsEnabled
      ? suggestionsConfigData?.config?.followUpMessagePrompt
      : undefined;

    const payload: LLMRequestDto = {
      provider: modelConfig.provider as ProviderLiteral,
      model: modelConfig.model,
      input: buildLLMInput(systemPrompt, userPrompt, followUpPrompt),
      files: dataUrlFiles,
      is_json_output: modelConfig.is_json_output,
      json_schema: formData.useJSONSchema ? (formData.json_schema as string) : null,
      max_output_tokens: modelConfig.max_output_tokens ?? null,
      is_byok_enabled: modelConfig.is_byok_enabled,
      credential_id: modelConfig.credential_id || null,
      temperature: modelConfig.temperature,
      top_p: modelConfig.top_p,
      kb_names: kbConfigData ? kbConfigData.config.knowledgeBase : null,
      stream: false,
      ref_id: currentFlow.id,
      ref_name: currentFlow.name,
      ref_type: "Agent",
      action: "AgentExecution",
    };

    if (hasToolConfig) {
      payload.tool_config = toolsConfigData!.config as ToolConfigDto[];
    }

    if (isConversationAgent) {
      payload.is_chat_agent = true;
      payload.generate_followup_messages = dynamicActionsEnabled;
    }

    return payload;
  }

  async function execute(userPrompt: string) {
    const payload = await buildPayload(userPrompt);
    if (!payload) return;
    mutation.mutate(payload);
  }

  return { ...mutation, buildPayload, execute };
}
