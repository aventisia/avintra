import { DCPTabsFooterWrapper } from "@/features/dynamic-config-panel/components/dcp-tabs/DCPTabsFooterWrapper";
import {
  LLMRequestDto,
  LLMResponseDto,
  ProviderLiteral,
} from "@/features/dynamic-config-panel/dtos/llm-providers-dto";
import {
  STTRequestDto,
  STTResponseDto,
} from "@/features/dynamic-config-panel/dtos/stt-model-dto";
import {
  TTSRequestDto,
  TTSResponseDto,
} from "@/features/dynamic-config-panel/dtos/tts-model-dto";
import {
  fileToDataUrl,
  filesToDataUrls,
} from "@/features/dynamic-config-panel/utils/file-to-data-url";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { ModelConfigType, VoiceConfigType } from "@/types/model-config-type";

import { Button } from "@aventisia/ui/buttons";
import { IHttpResponse } from "@aventisia/ui/dtos";
import { cn } from "@aventisia/ui/lib";
import { toast } from "@aventisia/ui/sonner";
import { UseMutateFunction } from "@tanstack/react-query";
import { Loader2, Sparkles } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { STTInputValue } from "./STTInputStep";

/* Helper to extract the primary ModelConfig object regardless of node type suffix */
function getModelConfig(
  data: Record<string, unknown>,
): { config: ModelConfigType; key: string } | null {
  for (const key in data) {
    if (key.includes("__ModelConfig__")) {
      return { config: data[key] as ModelConfigType, key };
    }
  }
  return null;
}

/* Helper to extract the primary VoiceConfig object regardless of node type suffix */
function getVoiceConfig(
  data: Record<string, unknown>,
): { config: VoiceConfigType; key: string } | null {
  for (const key in data) {
    if (key.includes("__VoiceConfig__")) {
      return { config: data[key] as VoiceConfigType, key };
    }
  }
  return null;
}

type LLMMutate = UseMutateFunction<
  IHttpResponse<LLMResponseDto>,
  Error,
  LLMRequestDto,
  unknown
>;
type STTMutate = UseMutateFunction<
  IHttpResponse<STTResponseDto>,
  Error,
  STTRequestDto,
  unknown
>;
type TTSMutate = UseMutateFunction<
  IHttpResponse<TTSResponseDto>,
  Error,
  TTSRequestDto,
  unknown
>;

interface ExecuteButtonProps {
  mutate: LLMMutate | STTMutate | TTSMutate;
  formData: Record<string, unknown>;
  isPending: boolean;
  providerType: "llm" | "stt" | "tts";
  llmFiles?: File[];
  sttInput?: STTInputValue;
  /**
   * When provided, overrides formData["InputText"] as the TTS input string.
   *
   * The TTS test screen now shows its own editable textarea so the user can
   * type (or paste) text without having to close the test panel and edit the
   * node config form.  ModelTestContent controls that textarea and passes its
   * current value here so the payload builder uses it instead of whatever was
   * saved in the node configuration.
   */
  ttsInputOverride?: string;
}

const ExecuteButton = ({
  isPending,
  mutate,
  formData,
  providerType,
  llmFiles,
  sttInput,
  ttsInputOverride,
}: ExecuteButtonProps) => {
  const { currentFlow } = useCurrentFlowStore(
    useShallow((state) => ({ currentFlow: state.currentFlow })),
  );

  /* Compile LLM Execution Payload */
  async function buildLLMPayload(): Promise<LLMRequestDto | null> {
    const promptKey = Object.keys(formData).find((k) =>
      k.includes("__Prompt__"),
    );
    const input = promptKey ? (formData[promptKey] as string) : "";

    const modelConfigData = getModelConfig(formData);
    if (!modelConfigData) {
      toast.error("Model configuration is missing");
      return null;
    }

    const { config: modelConfig } = modelConfigData;

    let files: string[] | undefined;

    if (llmFiles && llmFiles.length > 0) {
      files = await filesToDataUrls(llmFiles);
    }

    return {
      provider: modelConfig.provider as ProviderLiteral,
      model: modelConfig.model,
      input,
      files,
      is_json_output: modelConfig.is_json_output,
      json_schema: formData.useJSONSchema
        ? (formData.json_schema as string)
        : null,
      max_output_tokens: modelConfig.max_output_tokens,
      is_byok_enabled: modelConfig.is_byok_enabled,
      credential_id: modelConfig.credential_id || null,
      temperature: modelConfig.temperature,
      top_p: modelConfig.top_p,
      stream: false,
      ref_id: currentFlow.id,
      ref_name: currentFlow.name,
      ref_type: "Agent",
      action: "AgentExecution",
    };
  }

  /* Compile STT Execution Payload */
  async function buildSTTPayload(): Promise<STTRequestDto | null> {
    if (!sttInput) {
      toast.error("STT input is missing");
      return null;
    }

    const modelConfigData = getModelConfig(formData);
    if (!modelConfigData) {
      toast.error("Model configuration is missing");
      return null;
    }

    const { config: modelConfig } = modelConfigData;

    let input = "";

    switch (sttInput.mode) {
      case "file": {
        if (!sttInput.file) {
          toast.error("No audio file selected");
          return null;
        }

        input = await fileToDataUrl(sttInput.file);
        break;
      }

      case "url": {
        if (!sttInput.url?.trim()) {
          toast.error("No URL provided");
          return null;
        }

        input = sttInput.url.trim();
        break;
      }

      case "text": {
        if (!sttInput.text?.trim()) {
          toast.error("No text provided");
          return null;
        }

        input = sttInput.text.trim();
        break;
      }
    }

    return {
      input,
      input_mode: sttInput.mode,
      provider: modelConfig.provider,
      model: modelConfig.model,
      audio_format: sttInput.audio_format || "audio/wav",
      language: sttInput.language?.trim() || null,
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

  /* Compile TTS Execution Payload */
  async function buildTTSPayload(): Promise<TTSRequestDto | null> {
    /*
     * Prefer the override value coming from the test tab's own textarea.
     * Fall back to whatever is stored in the node's formData so execution
     * still works even when ttsInputOverride isn't wired up.
     */
    const input =
      ttsInputOverride !== undefined
        ? ttsInputOverride
        : (formData["InputText"] as string);

    const modelConfigData = getModelConfig(formData);
    const voiceConfigData = getVoiceConfig(formData);

    if (!modelConfigData) {
      toast.error("Model configuration is missing");
      return null;
    }

    return {
      provider: modelConfigData.config.provider,
      input,
      model: modelConfigData.config.model,
      voice_id: voiceConfigData?.config.voice || null,
      language: voiceConfigData?.config.language || null,
      speed: voiceConfigData?.config.speed,
      // pitch: voiceConfigData?.config.pitch,
      stream: false,
      credentials_id: modelConfigData.config.credential_id || null,
      is_byok_enabled: modelConfigData.config.is_byok_enabled,
      ref_id: currentFlow.id,
      ref_name: currentFlow.name,
      ref_type: "Agent",
      action: "AgentExecution",
      agent_name: currentFlow.name ?? null,
    };
  }

  const handleExecute = async () => {
    if (providerType === "stt") {
      const payload = await buildSTTPayload();
      if (!payload) return;
      (mutate as STTMutate)(payload);
      return;
    }

    if (providerType === "tts") {
      const payload = await buildTTSPayload();
      if (!payload) return;
      (mutate as TTSMutate)(payload);
      return;
    }

    const payload = await buildLLMPayload();
    if (!payload) return;
    (mutate as LLMMutate)(payload);
  };

  return (
    <DCPTabsFooterWrapper className="justify-start">
      <Button
        onClick={handleExecute}
        size="sm"
        type="button"
        disabled={isPending}
        className={cn(
          "relative overflow-hidden transition-all duration-300 ease-out",
        )}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Executing
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4 text-primary-foreground" />
            Execute
          </>
        )}

        {/* Subtle background shimmer effect when processing */}
        {isPending && (
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        )}
      </Button>
    </DCPTabsFooterWrapper>
  );
};

export default ExecuteButton;
