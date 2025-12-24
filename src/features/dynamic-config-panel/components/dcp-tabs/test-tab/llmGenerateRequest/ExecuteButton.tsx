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

interface ModelConfigType {
  isByokEnabled: boolean;
  provider: string;
  credentials: string;
  model: string;
  temperature: number;
  topP: number;
  isJsonOutput: boolean;
  maxOutputToken: number;
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

  function mapNodeDataToLLMRequest(data: {
    [x: string]: unknown;
  }): LLMRequestDto {
    let input = "";
    let files: string[] | undefined;
    let modelConfig: ModelConfigType | null = null;

    // Loop through the input object and check for a key that includes "__ModelConfig__".
    for (const key in data) {
      // Check if the key includes "__ModelConfig__" and extract the model config.
      if (key.includes("__ModelConfig__")) {
        modelConfig = data[key] as ModelConfigType;
        break; // We stop once we find the first match.
      }
    }

    // Validate that the model configuration is found.
    if (!modelConfig) {
      throw new Error("Model configuration is missing");
    }

    // Extract prompt from the main data.
    input = (data.prompt as string) ?? "";

    // Check if any files are provided. Adjust as per your actual data structure.
    if (data.Files) {
      files = Array.isArray(data.Files) ? data.Files : undefined;
    }

    // Create the LLMRequestDto based on the extracted data.
    const requestDto: LLMRequestDto = {
      provider: modelConfig.provider as ProviderLiteral,
      model: modelConfig.model,
      input: input, // The prompt value
      files: files,
      is_json_output: modelConfig.isJsonOutput,
      json_schema: null,
      max_output_tokens: modelConfig.maxOutputToken,
      is_byok_enabled: modelConfig.isByokEnabled,
      credential_id: modelConfig.credentials || null,
      temperature: modelConfig.temperature,
      top_p: modelConfig.topP,
      stream: false,
      ref_id: currentFlow.id, // Reference the currentFlow
      ref_name: currentFlow.name, // Reference the currentFlow
      ref_type: "Agent",
      action: "AgentExecution",
    };

    return requestDto;
  }

  return (
    <DCPTabsFooterWrapper className="justify-start">
      <Button
        onClick={() => {
          if (formData) mutate(mapNodeDataToLLMRequest(formData));
        }}
        size={"sm"}
        type="button"
        disabled={isPending}
      >
        Execute
      </Button>
    </DCPTabsFooterWrapper>
  );
};

export default ExecuteButton;
