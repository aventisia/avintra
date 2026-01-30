import { DCPTabsFooterWrapper } from "@/features/dynamic-config-panel/components/dcp-tabs/DCPTabsFooterWrapper";
import {
  LLMRequestDto,
  LLMResponseDto,
  ProviderLiteral,
} from "@/features/dynamic-config-panel/dtos/llm-providers-dto";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { Button } from "@aventisia/ui/buttons";
import { IHttpResponse } from "@aventisia/ui/dtos";
import { UseMutateFunction } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";
import { readFileAsBase64 } from "./readFileUsingTauri";
import { IS_TAURI } from "@/constants";

interface ModelConfigType {
  is_byok_enabled: boolean;
  provider: string;
  credential_id: string;
  model: string;
  temperature: number;
  top_p: number;
  is_json_output: boolean;
  max_output_tokens: number;
}

interface ExecutionButtonProps {
  mutate: UseMutateFunction<
    IHttpResponse<LLMResponseDto>,
    Error,
    LLMRequestDto,
    unknown
  >;
  formData: {
    [x: string]: unknown;
  };
  isPending: boolean;
}

const ExecuteButton = ({
  isPending,
  mutate,
  formData,
}: ExecutionButtonProps) => {
  // Get currentFlow action from current flow store
  const { currentFlow } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
    })),
  );

  async function mapNodeDataToLLMRequest(
    data: Record<string, unknown>,
  ): Promise<LLMRequestDto> {
    // -------- Prompt --------
    const promptKey = Object.keys(data).find((k) => k.includes("__Prompt__"));

    const input = promptKey ? (data[promptKey] as string) : "";

    // -------- Model Config --------
    let modelConfig: ModelConfigType | null = null;

    for (const key in data) {
      if (key.includes("__ModelConfig__")) {
        modelConfig = data[key] as ModelConfigType;
        break;
      }
    }

    if (!modelConfig) {
      throw new Error("Model configuration is missing");
    }

    // -------- Files (paths → base64) --------
    let files: string[] | undefined;

    if (data.Files && IS_TAURI) {
      const filePaths = Array.isArray(data.Files)
        ? (data.Files as string[])
        : (data.Files as string)?.split(",");

      const base64Results = await Promise.all(
        filePaths.map((path) => readFileAsBase64(path)),
      );

      files = base64Results?.filter((f): f is string => typeof f === "string");
    }

    // -------- Build DTO --------
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

  const handleExecute = async () => {
    if (!formData) return;

    try {
      const payload = await mapNodeDataToLLMRequest(formData);
      mutate(payload);
    } catch (err) {
      console.error("Execution failed:", err);
    }
  };

  return (
    <DCPTabsFooterWrapper className="justify-start">
      <Button
        onClick={handleExecute}
        size="sm"
        type="button"
        disabled={isPending}
      >
        Execute
      </Button>
    </DCPTabsFooterWrapper>
  );
};

export default ExecuteButton;
