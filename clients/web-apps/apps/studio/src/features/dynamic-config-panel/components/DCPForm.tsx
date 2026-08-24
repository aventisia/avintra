import { LoadingSpinner } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { Form } from "@avplatform/ui/form";
import { cn } from "@avplatform/ui/lib";
import { toast } from "@avplatform/ui/sonner";
import { FlaskConical, InfoIcon, PlayIcon, SearchCodeIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";

import ImproveWithAIButton from "@/features/dynamic-config-panel/components/dcp-tabs/ImproveWithAIButton";
import { useIsVersionHistoryRoute } from "@/features/version-history/hooks/useIsVersionHistoryRoute";

import { RenderField, shouldRenderField, useDefineDCPForm, useUpdateNodeDataIO } from "..";
import { refineSubmittedIO } from "../utils/refine-submitted-io";
import { DCPTabsContent } from "./dcp-tabs/DCPTabsContent";
import { DCPTabsFooterWrapper } from "./dcp-tabs/DCPTabsFooterWrapper";
import { DCPTabsList } from "./dcp-tabs/DCPTabsList";
import { DCPTabsListWrapper } from "./dcp-tabs/DCPTabsListWrapper";
import { DCPTabsTrigger } from "./dcp-tabs/DCPTabsTrigger";
import { DCPTabsWrapper } from "./dcp-tabs/DCPTabsWrapper";
import TestTabContent from "./dcp-tabs/node-test-tab/TestTabContent";

export const DCPForm = () => {
  const [showOuputFields, setShowOutputFields] = useState(false);

  const isAgentHistory = useIsVersionHistoryRoute();

  // Define form
  const {
    form,
    watch,
    nodeConfig,
    isFormReady,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    nodeConfigZodSchema,
    nodeId,
    nodeUniqueName,
    inputKeys,
    outputKeys,
    nodeLabel,
    setShowDialog,
    isLoading,
    selectedTab,
    setSelectedTab,
    tabKeys,
  } = useDefineDCPForm();

  // Watch all form values
  const watchedValues = watch();

  // Get handlers to update node inputs and outputs
  const { updateNodeDataIO, updateFlowVariablesObject } = useUpdateNodeDataIO();

  // Check if output fields should be shown based on node configuration and watched values
  useEffect(() => {
    const renderedOutputFields = nodeConfig?.fields?.filter((field) =>
      shouldRenderField("Output", field, watchedValues),
    );

    setShowOutputFields(Number(renderedOutputFields?.map((field) => field.name)?.length) > 0);
  }, [nodeConfig?.fields, isFormReady, nodeConfig, watchedValues]);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof nodeConfigZodSchema>) => {
    // Extract node inputs and outputs from formData
    const { inputs, outputs } = refineSubmittedIO(nodeUniqueName, formData, inputKeys, outputKeys);

    // Update node data inputs and outputs
    if (nodeId) {
      updateNodeDataIO(nodeId, inputs, outputs, nodeLabel);

      // Update flow variables object from real outputs or from SetVariableNode's dynamic variable name
      const variableName = formData["VariableName"]?.toString();
      if (nodeUniqueName === "SetVariableNode" && variableName) {
        updateFlowVariablesObject(nodeId, [
          {
            key: variableName,
            value: { value: variableName, enabled: true },
          },
        ]);
      } else if (outputs.length > 0) {
        updateFlowVariablesObject(nodeId, outputs);
      }
    } else {
      toast.error("Node id is undefined. Cannot update node data");
      console.error("Node id is undefined. Cannot update node data.");
    }

    if (selectedTab !== "Test") {
      // Close the dialog
      setShowDialog(false);
    }
  };

  // Return the form
  return (
    <>
      {isLoading ? (
        <div className="flex h-[calc(100vh-9rem)] items-center justify-center gap-2 text-sm">
          <LoadingSpinner className="h-5 w-5 text-primary" />
        </div>
      ) : !isFormReady ? (
        <div className="flex h-[calc(100vh-9rem)] items-center justify-center gap-2 text-sm">
          <SearchCodeIcon className="text-icon h-5 w-5" />
          Configuration not found for this node.
        </div>
      ) : (
        <DCPTabsWrapper setTabValue={setSelectedTab} tabValue={selectedTab}>
          <DCPTabsListWrapper>
            <DCPTabsList>
              {tabKeys
                ?.filter((key) => import.meta.env.MODE !== "production" || key !== "Tools")
                ?.map((key) => (
                  <DCPTabsTrigger
                    tabValue={key}
                    children={key.replace(/([a-z])([A-Z])/g, "$1 $2")}
                  />
                ))}
            </DCPTabsList>
            {!isAgentHistory ? (
              import.meta.env.MODE !== "production" ? (
                <>
                  {nodeConfig.testScreenType == "standard" && (
                    <DCPTabsList>
                      <DCPTabsTrigger
                        tabValue="Test"
                        className="flex items-center gap-1 text-primary hover:text-primary"
                        handleClick={() => {
                          onSubmit(form.getValues());
                        }}
                      >
                        <PlayIcon className="h-3 w-3" />
                        <span> Test</span>
                      </DCPTabsTrigger>
                    </DCPTabsList>
                  )}
                  {nodeConfig.testScreenType == "llmGenerateRequest" && (
                    <DCPTabsList>
                      <DCPTabsTrigger
                        tabValue="Test"
                        className="flex items-center gap-1 text-primary hover:text-primary"
                        handleClick={() => {
                          onSubmit(form.getValues());
                        }}
                      >
                        <FlaskConical className="h-3.5 w-3.5" />
                        <span> Test</span>
                      </DCPTabsTrigger>
                    </DCPTabsList>
                  )}
                </>
              ) : (
                nodeConfig.testScreenType == "llmGenerateRequest" && (
                  <DCPTabsList>
                    <DCPTabsTrigger
                      tabValue="Test"
                      className="flex items-center gap-1 text-primary hover:text-primary"
                      handleClick={() => {
                        onSubmit(form.getValues());
                      }}
                    >
                      <FlaskConical className="h-3.5 w-3.5" />
                      <span> Test</span>
                    </DCPTabsTrigger>
                  </DCPTabsList>
                )
              )
            ) : null}
          </DCPTabsListWrapper>

          <Form
            methods={form}
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit(form.getValues());
            }}
          >
            {tabKeys?.map((tab, tabNo) => (
              <DCPTabsContent tabValue={tab}>
                {/* Input fields */}
                <div className="space-y-3.5">
                  {nodeConfig?.fields
                    ?.filter((field) => (field.category ?? "Inputs") == tab)
                    ?.map((field) => {
                      // Check if the field should be rendered based on direction and renderIf conditions
                      if (!shouldRenderField("Input", field, watchedValues)) {
                        //Remove the key from inputKeys if the field is not rendered
                        if (inputKeys.includes(field.name))
                          inputKeys.splice(inputKeys.indexOf(field.name), 1);
                        return null;
                      }

                      // Add the field name to inputKeys if not already present
                      if (!inputKeys.includes(field.name)) inputKeys.push(field.name);

                      // Render the field
                      return <RenderField key={field.name} {...field} />;
                    })}
                </div>

                {/* Output fields */}
                {tabNo == 0 &&
                showOuputFields &&
                Number(nodeConfig?.fields?.filter((field) => field.direction == "Output")?.length) >
                  0 ? (
                  <>
                    <h3
                      className={cn(
                        "relative !my-8 flex h-[0.06rem] items-center gap-1 border-[0.5px] border-x-0 border-t-0",
                        nodeConfig?.fields?.filter(
                          (field) =>
                            (field.category ?? "Inputs") == tab && field.direction == "Input",
                        ).length == 0 && "!mt-2",
                      )}
                    >
                      <div className="absolute -top-3">
                        <span className="rounded-full bg-indigo-100 px-1.5 py-1 text-xs font-medium text-indigo-600">
                          Outputs
                        </span>
                      </div>
                    </h3>

                    <div className="mb-1 mt-3 space-y-3 rounded-lg border bg-slate-50 px-3.5 py-3">
                      {nodeConfig?.fields?.map((field) => {
                        // Check if the field should be rendered based on direction and renderIf conditions
                        if (!shouldRenderField("Output", field, watchedValues)) {
                          //Remove the key from outputKeys if the field is not rendered
                          if (outputKeys.includes(field.name))
                            outputKeys.splice(outputKeys.indexOf(field.name), 1);
                          return null;
                        }

                        // Add the field name to outputKeys if not already present
                        if (!outputKeys.includes(field.name)) outputKeys.push(field.name);

                        return <RenderField key={field.name} {...field} />;
                      })}
                    </div>
                  </>
                ) : null}
              </DCPTabsContent>
            ))}

            {/* Save button */}
            {selectedTab !== "Test" && (
              <DCPTabsFooterWrapper
                className={cn((selectedTab == "Prompt" || isAgentHistory) && "justify-between")}
              >
                {selectedTab == "Prompt" && !isAgentHistory && (
                  <ImproveWithAIButton
                    disabled={isAgentHistory}
                    name={nodeConfig.fields.find((v) => v.type == "prompt-input")?.name ?? ""}
                    form={form}
                  />
                )}

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
            )}
          </Form>
          <TestTabContent
            type={nodeConfig?.testScreenType ?? "standard"}
            formData={form.getValues()}
            nodeUniqueName={nodeUniqueName}
          />
        </DCPTabsWrapper>
      )}
    </>
  );
};
