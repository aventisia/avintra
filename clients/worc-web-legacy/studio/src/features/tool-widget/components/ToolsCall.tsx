import { LLMToolsOutputDto } from "@/features/assistant-ui/dtos/llm-response.dto";

import { ToolProvider } from "../constants/tools-provider-enum";
import { useToolExecutionMutation } from "../hooks/useToolsExecutionMutation";
import { createPayloadFields } from "../utils/create-dcp-json";
import { toolIconMapper } from "../utils/tools-provider-config";
import { ToolCallAccordion } from "./ToolCallAccordion";
import DynamicForm from "./dynamic-form/DynamicForm";

export default function ToolsCall({ data }: { data?: LLMToolsOutputDto[] }) {
  if (!data?.length) return;

  const basePath = import.meta.env.VITE_AGENTBUILDER_PATH.replace(/\/$/, "");

  const formConfig = createPayloadFields(data);

  const { output } = data[0];

  const provider = output?.provider?.toLowerCase() as ToolProvider;

  const {
    mutate: executeMutation,
    cancel,
    isPending,
  } = useToolExecutionMutation({
    provider,
  });

  const onSubmit = (data: Record<string, unknown>) => {
    executeMutation({
      agentId: output?.agentId ?? "",
      agentName: output?.agentName ?? "",
      provider: output?.provider ?? "",
      action: output?.action ?? "",
      credentialId: output?.credentialId ?? "",
      payload: data,
    });
  };

  return (
    <ToolCallAccordion
      toolName={output?.action ?? ""}
      status="idle"
      iconSrc={provider ? basePath + toolIconMapper[provider] : ""}
    >
      <DynamicForm
        config={formConfig}
        onSubmit={onSubmit}
        onCancel={isPending ? cancel : () => {}}
        isPending={isPending}
      />
    </ToolCallAccordion>
  );
}
