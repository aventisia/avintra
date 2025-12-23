import ExecuteButton from "./ExecuteButton";
import { DCPTabsContent } from "@/features/dynamic-config-panel/components/dcp-tabs/DCPTabsContent";
import { JsonViewer } from "@/components/json-viewer/JsonViewer";
import { useExecuteModelMutation } from "@/features/dynamic-config-panel/hooks/useExecuteModelMutation";
import JsonViewerSkeleton from "@/components/json-viewer/JsonViewerSkeleton";
import { LLMResponseDto } from "@/features/dynamic-config-panel/dtos/llm-providers-dto";

const ModelTestContent = ({
  formData,
}: {
  formData: {
    [x: string]: unknown;
  };
}) => {
  const { mutate, isPending, data } = useExecuteModelMutation();

  const testD = data as unknown as LLMResponseDto;

  return (
    <DCPTabsContent
      tabValue="Test"
      footer={
        <ExecuteButton
          isPending={isPending}
          mutate={mutate}
          formData={formData}
        />
      }
    >
      <div className="border-dividers overflow-hidden rounded-lg border border-solid">
        {isPending ? (
          <JsonViewerSkeleton />
        ) : (
          <JsonViewer
            jsonData={
              testD ? (testD?.output ?? "{}") : (JSON.stringify(formData) ?? "")
            }
            className="h-[calc(64vh)]"
            enableCopy
          />
        )}
      </div>
    </DCPTabsContent>
  );
};

export default ModelTestContent;
