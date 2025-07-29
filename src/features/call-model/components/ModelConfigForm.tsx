import { Form, InputField } from "@aventisia/ui/form";
import { Controller } from "react-hook-form";
import {
  ConfigPanelAutosizeTextareaField,
  ConfigPanelOuputField,
  useUpdateNodeDataIO,
} from "@/features/dynamic-config-panel";
import { Button } from "@aventisia/ui/buttons";
import { ModelSelector } from "./ModelSelector";
import { useSearchModel } from "../hooks/useSearchModel";
import { NodeInputType, NodeOutputType } from "@/types/node-data-type";
import { useCallModelForm } from "../hooks/useCallModelForm";
import { modelFormData } from "../constants/model-config-zod-schema";
import { ConfigPanelModelOutputField } from "@/features/dynamic-config-panel/components/fields-for-form/ConfigPanelModelOutputField";

export default function ModelConfigForm() {
  // Get handlers to update node inputs and outputs
  const { updateNodeDataIO, updateFlowVariablesObject } = useUpdateNodeDataIO();
  const { control, form, nodeId, setShowDialog, aiModelResultDescription } =
    useCallModelForm();

  const onSubmit = (data: modelFormData) => {
    const RequestBody = {
      modelId: data.MLModel.id,
      content: data.inputText,
      modelTaskIds: null,
    };

    const inputData: NodeInputType[] = [
      { key: "SelectModel", value: data.MLModel.id },
      { key: "InputText", value: data.inputText },
      { key: "ModelApiKey", value: data.modelApiKey },
      {
        key: "EndpointUrl",
        value: `${import.meta.env.VITE_AISTUDIO_API_URL}/ai-models/execute`,
      },
      { key: "RequestBody", value: JSON.stringify(RequestBody) },
      { key: "Headers", value: `X-API-KEY: ${data.modelApiKey}` },
    ];

    const outputData: NodeOutputType[] = [
      {
        key: "AIModelResult",
        value: {
          value: data.AIModelResult?.value ?? "AIModelResult",
          enabled: data.AIModelResult?.enabled ?? false,
        },
      },
      {
        key: "ResponseCode",
        value: {
          value: data.ResponseCode?.value ?? "ResponseCode",
          enabled: data.ResponseCode?.enabled ?? false,
        },
      },
    ];

    if (nodeId) {
      // Update node data inputs outputs and selectedModel
      updateNodeDataIO(
        nodeId,
        inputData,
        outputData,
        undefined,
        undefined,
        undefined,
        data.MLModel,
      );

      // Update flow variables object
      updateFlowVariablesObject(nodeId, outputData);
    }

    setShowDialog(false);
  };

  const resultProps = {
    name: "AIModelResult",
    description: aiModelResultDescription,
  };

  const {
    searchTerm,
    setSearchTerm,
    searchData,
    isLoading: isUserLoading,
    isError,
  } = useSearchModel();

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      //  disabled={isSubmitting}
      // className="space-y-4"
    >
      <Controller
        name="MLModel"
        control={control}
        render={({ field }) => (
          <ModelSelector
            selectedItem={field.value || null}
            searchResults={searchData?.data || []}
            onItemSelect={(item) => field.onChange(item)}
            onItemClear={() => field.onChange(null)}
            onSearchChange={setSearchTerm}
            searchQuery={searchTerm}
            isLoading={isUserLoading}
            isError={isError}
            placeholder="Search Model"
          />
        )}
      />
      <ConfigPanelAutosizeTextareaField
        minHeight={0}
        name="inputText"
        label="Input Text"
        description="Enter the text to be processed."
      />
      <ConfigPanelAutosizeTextareaField
        minHeight={0}
        name="modelApiKey"
        label="Model API Key"
        description="Enter the API key required to authenticate requests to the selected ML model."
      />

      <InputField
        name="llm"
        label="LLM"
        description="LLM used for selected model"
        fieldSize="sm"
        disabled
      />

      <h3 className="!mt-6 flex items-center gap-1 text-sm font-medium">
        <span className="rounded-full bg-accent px-1.5 text-indigo-600">
          Outputs
        </span>
        <span className="h-[0.06rem] flex-grow rounded bg-accent"></span>
      </h3>

      <div className="space-y-2 rounded-lg border bg-slate-50 px-3.5 py-3">
        <ConfigPanelOuputField
          name="ResponseCode"
          description="Response code"
        />
        <ConfigPanelModelOutputField {...resultProps} />
      </div>
      <div className="flex w-full items-center justify-end pb-4">
        <Button type="submit">Save</Button>
      </div>
    </Form>
  );
}
