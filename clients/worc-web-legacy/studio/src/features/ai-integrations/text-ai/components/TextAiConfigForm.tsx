// import {
//   ConfigPanelAutosizeTextareaField,
//   ConfigPanelOuputField,
//   useUpdateNodeDataIO,
// } from "@/features/dynamic-config-panel";
import { ConfigPanelOuputField } from "@/features/dynamic-config-panel";
import { DCPTabsContent } from "@/features/dynamic-config-panel/components/dcp-tabs/DCPTabsContent";
import { DCPTabsFooterWrapper } from "@/features/dynamic-config-panel/components/dcp-tabs/DCPTabsFooterWrapper";
import { DCPTabsList } from "@/features/dynamic-config-panel/components/dcp-tabs/DCPTabsList";
import { DCPTabsListWrapper } from "@/features/dynamic-config-panel/components/dcp-tabs/DCPTabsListWrapper";
import { DCPTabsTrigger } from "@/features/dynamic-config-panel/components/dcp-tabs/DCPTabsTrigger";
import { DCPTabsWrapper } from "@/features/dynamic-config-panel/components/dcp-tabs/DCPTabsWrapper";
// import { useSearchModel } from "../hooks/useSearchModel";
// import { ModelSelector } from "./ModelSelector";
import { PromptConfigField } from "@/features/dynamic-config-panel/components/fields-for-form/prompt-field/PromptField";
// import { ConfigPanelModelOutputField } from "@/features/dynamic-config-panel/components/fields-for-form/ConfigPanelModelOutputField";
import { useIsVersionHistoryRoute } from "@/features/version-history/hooks/useIsVersionHistoryRoute";

// import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
// import { NodeInputType, NodeOutputType } from "@/types/node-data-type";

import { Button } from "@aventisia/ui/buttons";
import { Form } from "@aventisia/ui/form";
import { cn } from "@aventisia/ui/lib";
import { InfoIcon } from "lucide-react";
import { useState } from "react";

// import { Controller } from "react-hook-form";
// import { useShallow } from "zustand/react/shallow";

import { TextAiFormData } from "../constants/text-ai-config-zod-schema";
import { useDefineTextAiForm } from "../hooks/useDefineTextAiForm";

/* TODO: This form is partially implemented */
export default function TextAiConfigForm() {
  const [selectedTab, setSelectedTab] = useState("Prompt");
  const isAgentHistory = useIsVersionHistoryRoute();

  // Get handlers to update node inputs and outputs
  // const { updateNodeDataIO, updateFlowVariablesObject } = useUpdateNodeDataIO();
  const { form, setShowDialog } = useDefineTextAiForm();
  // Get user session state and actions
  // const { userSession } = useUserSessionStore(
  //   useShallow((state) => ({
  //     userSession: state.userSession,
  //   })),
  // );

  const onSubmit = (data: TextAiFormData) => {
    console.log(data);

    // const inputData: NodeInputType[] = [
    //   {
    //     key: "HttpMethod",
    //     value: "POST",
    //   },
    //   { key: "SelectModel", value: data.MLModel.id },
    //   { key: "InputText", value: data.inputText },
    //   { key: "ModelApiKey", value: data.modelApiKey },
    //   {
    //     key: "EndpointUrl",
    //     value: `${window.location.origin}${import.meta.env.VITE_AISTUDIO_API_PATH}/ai-models/execute`,
    //   },
    //   { key: "RequestBody", value: JSON.stringify(RequestBody) },
    //   {
    //     key: "Headers",
    //     value: JSON.stringify({
    //       "X-API-KEY": data.modelApiKey,
    //       tntid: userSession?.tenantId,
    //     }),
    //   },
    // ];

    // const outputData: NodeOutputType[] = [
    //   {
    //     key: "AIModelResult",
    //     value: {
    //       value: data.AIModelResult?.value ?? "AIModelResult",
    //       enabled: data.AIModelResult?.enabled ?? false,
    //     },
    //   },
    //   {
    //     key: "ResponseCode",
    //     value: {
    //       value: data.ResponseCode?.value ?? "ResponseCode",
    //       enabled: data.ResponseCode?.enabled ?? false,
    //     },
    //   },
    // ];

    // if (nodeId) {
    //   // Update node data inputs outputs and selectedModel
    //   updateNodeDataIO(
    //     nodeId,
    //     inputData,
    //     outputData,
    //     undefined,
    //     undefined,
    //     undefined,
    //     data.MLModel,
    //   );

    //   // Update flow variables object
    //   updateFlowVariablesObject(nodeId, outputData);
    // }

    setShowDialog(false);
  };

  return (
    <DCPTabsWrapper setTabValue={setSelectedTab} tabValue={selectedTab}>
      <DCPTabsListWrapper>
        <DCPTabsList>
          {/* <DCPTabsTrigger
            tabValue={"Inputs"}
            children={"Inputs".replace(/([a-z])([A-Z])/g, "$1 $2")}
          /> */}
          <DCPTabsTrigger
            tabValue={"Prompt"}
            children={"Prompt".replace(/([a-z])([A-Z])/g, "$1 $2")}
          />
        </DCPTabsList>
      </DCPTabsListWrapper>
      <Form
        methods={form}
        onSubmit={form.handleSubmit(onSubmit)}
        //  disabled={isSubmitting}
        // className="space-y-4"
      >
        {/* <DCPTabsContent tabValue={"Inputs"}>
          <div className="space-y-3.5">
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
          </div>
        </DCPTabsContent> */}
        <DCPTabsContent tabValue={"Prompt"}>
          <PromptConfigField name="__Prompt__TextAi" rows={16} />
          <ConfigPanelOuputField name="Result" description="AI Model Result." />
        </DCPTabsContent>

        <DCPTabsFooterWrapper
          className={cn(isAgentHistory && "justify-between")}
        >
          {isAgentHistory ? (
            <div className="flex items-center gap-1 text-muted-foreground">
              <InfoIcon className="h-3.5 w-3.5" />
              <span className="mt-0.5 text-xs">Changes will not be saved</span>
            </div>
          ) : null}
          <Button
            size={"sm"}
            disabled={isAgentHistory}
            type="submit"
            className="min-w-[5rem]"
          >
            Save
          </Button>
        </DCPTabsFooterWrapper>
      </Form>
    </DCPTabsWrapper>
  );
}
