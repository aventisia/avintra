import { toast } from "@aventisia/ui/sonner";
import { useShallow } from "zustand/react/shallow";

import {
  LLMRequestDto,
  ProviderLiteral,
} from "@/features/dynamic-config-panel/dtos/llm-providers-dto";
import { useExecuteModelMutation } from "@/features/dynamic-config-panel/hooks/useExecuteModelMutation";
import { filesToDataUrls } from "@/features/dynamic-config-panel/utils/file-to-data-url";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

import { getKBConfig, getModelConfig } from "../../utils/ai-node-config-helper";
import { useResetOnTestTabOpen } from "./useResetOnTestTabOpen";

/**
 * Resolves the `input` field for the LLM request.
 *
 * When the user hasn't typed a user-prompt override, `input` stays a plain
 * string (the node's saved prompt) — unchanged from current behavior.
 *
 * When a user prompt is present, the request switches to a role-based
 * message array (stringified) so the saved prompt acts as the system
 * instruction and the typed text is the user turn. This mirrors the
 * message shape already used by the chat agent runtime, so the backend
 * doesn't need a separate code path to interpret it.
 */
export function buildLLMInput(
  systemPrompt: string,
  userPrompt: string,
): string {
  const trimmedUserPrompt = userPrompt.trim();

  if (!trimmedUserPrompt) {
    return systemPrompt;
  }

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: trimmedUserPrompt },
  ];

  return JSON.stringify(messages);
}

export function useLLMExecute(
  formData: Record<string, unknown>,
  files: File[],
) {
  const { currentFlow } = useCurrentFlowStore(
    useShallow((state) => ({ currentFlow: state.currentFlow })),
  );
  const mutation = useExecuteModelMutation();
  useResetOnTestTabOpen(mutation.reset);

  /**
   * Builds the exact payload that would be sent to the LLM request.
   *
   * Exposed separately from `execute` (rather than inlined in the mutate
   * call) so the Test tab can render this same payload as a live preview
   * before the user hits Execute — keeping preview and actual request in
   * lockstep instead of two logic paths that can drift apart.
   */
  async function buildPayload(
    userPrompt: string,
  ): Promise<LLMRequestDto | null> {
    const promptKey = Object.keys(formData).find((k) =>
      k.includes("__Prompt__"),
    );
    const systemPrompt = promptKey ? (formData[promptKey] as string) : "";

    const modelConfigData = getModelConfig(formData);
    if (!modelConfigData) {
      toast.error("Model configuration is missing");
      return null;
    }
    const { config: modelConfig } = modelConfigData;

    const kbConfigData = getKBConfig(formData);

    const dataUrlFiles =
      files.length > 0 ? await filesToDataUrls(files) : undefined;

    return {
      provider: modelConfig.provider as ProviderLiteral,
      model: modelConfig.model,
      input: buildLLMInput(systemPrompt, userPrompt),
      files: dataUrlFiles,
      is_json_output: modelConfig.is_json_output,
      json_schema: formData.useJSONSchema
        ? (formData.json_schema as string)
        : null,
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
  }

  async function execute(userPrompt: string) {
    const payload = await buildPayload(userPrompt);
    if (!payload) return;
    mutation.mutate(payload);
  }

  return { ...mutation, buildPayload, execute };
}
