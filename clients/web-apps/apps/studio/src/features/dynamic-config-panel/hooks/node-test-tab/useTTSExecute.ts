import { toast } from "@avplatform/ui/sonner";
import { useShallow } from "zustand/react/shallow";

import { TTSRequestDto } from "@/features/dynamic-config-panel/dtos/tts-model-dto";
import { useExecuteTTSMutation } from "@/features/dynamic-config-panel/hooks/useExecuteTTSMutation";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

import { getModelConfig, getVoiceConfig } from "../../utils/ai-node-config-helper";
import { useResetOnTestTabOpen } from "./useResetOnTestTabOpen";

export function useTTSExecute(formData: Record<string, unknown>) {
  const { currentFlow } = useCurrentFlowStore(
    useShallow((state) => ({ currentFlow: state.currentFlow })),
  );
  const mutation = useExecuteTTSMutation();
  useResetOnTestTabOpen(mutation.reset);

  async function buildPayload(inputText: string): Promise<TTSRequestDto | null> {
    const modelConfigData = getModelConfig(formData);
    const voiceConfigData = getVoiceConfig(formData);

    if (!modelConfigData) {
      toast.error("Model configuration is missing");
      return null;
    }

    return {
      provider: modelConfigData.config.provider,
      input: inputText,
      model: modelConfigData.config.model,
      voice_id: voiceConfigData?.config.voice || null,
      language: voiceConfigData?.config.language || null,
      speed: voiceConfigData?.config.speed,
      stream: false,
      credential_name: modelConfigData.config.credential_name || null,
      is_byok_enabled: modelConfigData.config.is_byok_enabled,
      ref_id: currentFlow.id,
      ref_name: currentFlow.name,
      ref_type: "Agent",
      action: "AgentExecution",
      agent_name: currentFlow.name ?? null,
    };
  }

  async function execute(inputText: string) {
    const payload = await buildPayload(inputText);
    if (!payload) return;
    mutation.mutate(payload);
  }

  return { ...mutation, execute };
}
