import { Form } from "@aventisia/ui/form";
import { useCallAgentForm } from "../hooks/useCallAgentForm";
import {
  RenderField,
  shouldRenderField,
  useUpdateNodeDataIO,
} from "@/features/dynamic-config-panel";
import { Button } from "@aventisia/ui/buttons";
import { useEffect, useState } from "react";
import { z } from "zod";
import { LoadingSpinner } from "@aventisia/ui";
import { refineSubmittedIO } from "@/features/dynamic-config-panel/utils/refine-submitted-io";
import { toast } from "@aventisia/ui/sonner";
import { Controller } from "react-hook-form";
import { AgentSelector } from "./AgentSelector";
import { useSearchAgent } from "../hooks/useSearchAgent";
import { DCPTabsWrapper } from "@/features/dynamic-config-panel/components/dcp-tabs/DCPTabsWrapper";
import { DCPTabsListWrapper } from "@/features/dynamic-config-panel/components/dcp-tabs/DCPTabsListWrapper";
import { DCPTabsList } from "@/features/dynamic-config-panel/components/dcp-tabs/DCPTabsList";
import { DCPTabsTrigger } from "@/features/dynamic-config-panel/components/dcp-tabs/DCPTabsTrigger";
import { DCPTabsContent } from "@/features/dynamic-config-panel/components/dcp-tabs/DCPTabsContent";
import { DCPTabsFooterWrapper } from "@/features/dynamic-config-panel/components/dcp-tabs/DCPTabsFooterWrapper";

const CallAgentConfigForm = () => {
  const [selectedTab, setSelectedTab] = useState("Inputs");

  const [showOutputFields, setShowOutputFields] = useState(false);

  const {
    form,
    inputKeys,
    isFormReady,
    outputKeys,
    setShowDialog,
    nodeConfig,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    nodeConfigZodSchema,
    isLoading,
    watch,
    control,
    nodeLabel,
    nodeId,
    nodeUniqueName,
  } = useCallAgentForm();

  // Watch all form values
  const watchedValues = watch();

  // Get handlers to update node inputs and outputs
  const { updateNodeDataIO, updateFlowVariablesObject } = useUpdateNodeDataIO();

  // Check if output fields should be shown based on node configuration and watched values
  useEffect(() => {
    const renderedOutputFields = nodeConfig.filter((field) =>
      shouldRenderField("Output", field, watchedValues),
    );

    setShowOutputFields(
      renderedOutputFields.map((field) => field.name).length > 0,
    );
  }, [isFormReady, nodeConfig, watchedValues]);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof nodeConfigZodSchema>) => {
    // Extract node inputs and outputs from formData
    const { inputs, outputs } = refineSubmittedIO(
      nodeUniqueName,
      formData,
      inputKeys,
      outputKeys,
    );

    // Update node data inputs outputs and selectAgent
    if (nodeId) {
      updateNodeDataIO(
        nodeId,
        inputs,
        outputs,
        nodeLabel,
        formData?.selectAgent,
      );

      // Update flow variables object
      if (outputs.length > 0) updateFlowVariablesObject(nodeId, outputs);
    } else {
      toast.error("Node id is undefined. Cannot update node data");
      console.error("Node id is undefined. Cannot update node data.");
    }

    // Close the dialog
    setShowDialog(false);

    // Close the dialog
    setShowDialog(false);
  };
  const {
    searchTerm,
    setSearchTerm,
    searchData,
    isLoading: isUserLoading,
    isError,
  } = useSearchAgent();

  return (
    <>
      <DCPTabsWrapper setTabValue={setSelectedTab} tabValue={selectedTab}>
        <DCPTabsListWrapper>
          <DCPTabsList>
            <DCPTabsTrigger
              tabValue={"Inputs"}
              children={"Inputs".replace(/([a-z])([A-Z])/g, "$1 $2")}
            />
          </DCPTabsList>
        </DCPTabsListWrapper>

        <Form
          methods={form}
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(form.getValues());
          }}
          // className="px-2.5 pb-5"
        >
          <DCPTabsContent tabValue={"Inputs"}>
            <div className="space-y-3.5">
              <Controller
                name="selectAgent"
                control={control}
                render={({ field }) => (
                  <AgentSelector
                    selectedItem={field.value || null}
                    searchResults={searchData?.data || []}
                    onItemSelect={(item) => field.onChange(item)}
                    onItemClear={() => field.onChange(null)}
                    onSearchChange={setSearchTerm}
                    searchQuery={searchTerm}
                    isLoading={isUserLoading}
                    isError={isError}
                    placeholder="Search agent"
                  />
                )}
              />

              {isLoading ? (
                <div className="flex items-center justify-center gap-2 text-sm">
                  <LoadingSpinner className="h-5 w-5 text-primary" />
                </div>
              ) : (
                <>
                  {" "}
                  {/* Input fields */}
                  <div className="mt-1 space-y-3.5">
                    {nodeConfig.map((field) => {
                      // Check if the field should be rendered based on direction and renderIf conditions
                      if (!shouldRenderField("Input", field, watchedValues)) {
                        //Remove the key from inputKeys if the field is not rendered
                        if (inputKeys.includes(field.name))
                          inputKeys.splice(inputKeys.indexOf(field.name), 1);
                        return null;
                      }

                      // Add the field name to inputKeys if not already present
                      if (!inputKeys.includes(field.name))
                        inputKeys.push(field.name);

                      // Render the field
                      return <RenderField key={field.name} {...field} />;
                    })}
                  </div>
                  {/* Output fields */}
                  {showOutputFields ? (
                    <>
                      <h3 className="!mt-6 flex items-center gap-1 text-sm font-medium">
                        <span className="rounded-full bg-accent px-1.5 text-indigo-600">
                          Outputs
                        </span>
                        <span className="h-[0.06rem] flex-grow rounded bg-accent"></span>
                      </h3>

                      <div className="space-y-3 rounded-lg border bg-slate-50 px-3.5 py-3">
                        {nodeConfig.map((field) => {
                          // Check if the field should be rendered based on direction and renderIf conditions
                          if (
                            !shouldRenderField("Output", field, watchedValues)
                          ) {
                            //Remove the key from outputKeys if the field is not rendered
                            if (outputKeys.includes(field.name))
                              outputKeys.splice(
                                outputKeys.indexOf(field.name),
                                1,
                              );
                            return null;
                          }

                          // Add the field name to outputKeys if not already present
                          if (!outputKeys.includes(field.name))
                            outputKeys.push(field.name);

                          return <RenderField key={field.name} {...field} />;
                        })}
                      </div>
                    </>
                  ) : null}
                </>
              )}
            </div>
          </DCPTabsContent>
          {/* Save button */}
          <DCPTabsFooterWrapper>
            <Button size={"sm"} type="submit" className="min-w-[5rem]">
              Save
            </Button>
          </DCPTabsFooterWrapper>
        </Form>
      </DCPTabsWrapper>
    </>
  );
};

export default CallAgentConfigForm;
