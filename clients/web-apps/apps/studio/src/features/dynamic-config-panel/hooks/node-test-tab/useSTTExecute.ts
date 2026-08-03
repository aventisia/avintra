import { toast } from "@avplatform/ui/sonner";
import { useShallow } from "zustand/react/shallow";

import { STTRequestDto } from "@/features/dynamic-config-panel/dtos/stt-model-dto";
import { useExecuteSTTMutation } from "@/features/dynamic-config-panel/hooks/useExecuteSTTMutation";
import { fileToDataUrl } from "@/features/dynamic-config-panel/utils/file-to-data-url";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

import { STTInputValue } from "../../components/dcp-tabs/node-test-tab/llmGenerated/STTInputStep";
import { getModelConfig } from "../../utils/ai-node-config-helper";
import { useResetOnTestTabOpen } from "./useResetOnTestTabOpen";

/** Owns STT test execution: resolving the chosen input mode to a payload
 * `input` string, and the mutation itself. */
export function useSTTExecute(formData: Record<string, unknown>) {
  const { currentFlow } = useCurrentFlowStore(
    useShallow((state) => ({ currentFlow: state.currentFlow })),
  );
  const mutation = useExecuteSTTMutation();
  useResetOnTestTabOpen(mutation.reset);

  async function buildPayload(input: STTInputValue): Promise<STTRequestDto | null> {
    const modelConfigData = getModelConfig(formData);
    if (!modelConfigData) {
      toast.error("Model configuration is missing");
      return null;
    }
    const { config: modelConfig } = modelConfigData;

    let resolvedInput = "";
    switch (input.mode) {
      case "file":
        if (!input.file) {
          toast.error("No audio file selected");
          return null;
        }
        resolvedInput = await fileToDataUrl(input.file);
        break;
      case "url":
        if (!input.url?.trim()) {
          toast.error("No URL provided");
          return null;
        }
        resolvedInput = input.url.trim();
        break;
      case "text":
        if (!input.text?.trim()) {
          toast.error("No text provided");
          return null;
        }
        resolvedInput = input.text.trim();
        break;
    }

    return {
      input: resolvedInput,
      input_mode: input.mode,
      provider: modelConfig.provider,
      model: modelConfig.model,
      audio_format: input.audio_format || "audio/wav",
      language: input.language?.trim() || null,
      stream: false,
      credentials_id: modelConfig.credential_id || null,
      is_byok_enabled: modelConfig.is_byok_enabled ?? false,
      ref_id: currentFlow.id,
      ref_name: currentFlow.name,
      ref_type: "Agent",
      action: "AgentExecution",
      agent_name: currentFlow.name ?? null,
    };
  }

  async function execute(input?: STTInputValue) {
    if (!input) {
      toast.error("STT input is missing");
      return;
    }
    const payload = await buildPayload(input);
    if (!payload) return;
    mutation.mutate(payload);
  }

  return { ...mutation, execute };
}
