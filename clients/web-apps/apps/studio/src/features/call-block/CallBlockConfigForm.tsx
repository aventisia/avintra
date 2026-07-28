import { searchFlowVersions } from "@/apis/search-flow-versions-api";
import { SearchFlowVersionResDto } from "@/dtos/search-flow-version-res-dto";
import {
  RenderField,
  shouldRenderField,
  useUpdateNodeDataIO,
} from "@/features/dynamic-config-panel";
import { DCPTabsContent } from "@/features/dynamic-config-panel/components/dcp-tabs/DCPTabsContent";
import { DCPTabsFooterWrapper } from "@/features/dynamic-config-panel/components/dcp-tabs/DCPTabsFooterWrapper";
import { DCPTabsList } from "@/features/dynamic-config-panel/components/dcp-tabs/DCPTabsList";
import { DCPTabsListWrapper } from "@/features/dynamic-config-panel/components/dcp-tabs/DCPTabsListWrapper";
import { DCPTabsTrigger } from "@/features/dynamic-config-panel/components/dcp-tabs/DCPTabsTrigger";
import { DCPTabsWrapper } from "@/features/dynamic-config-panel/components/dcp-tabs/DCPTabsWrapper";
import { refineSubmittedIO } from "@/features/dynamic-config-panel/utils/refine-submitted-io";
import { useIsVersionHistoryRoute } from "@/features/version-history/hooks/useIsVersionHistoryRoute";

import { LoadingSpinner } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { AsyncSingleSelectField, Form } from "@avplatform/ui/form";
import { cn } from "@avplatform/ui/lib";
import { toast } from "@avplatform/ui/sonner";
import { InfoIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";

import { useCallBlockForm } from "./useCallBlockForm";

const CallBlockConfigForm = () => {
  const [selectedTab, setSelectedTab] = useState("Inputs");
  const isAgentHistory = useIsVersionHistoryRoute();

  const {
    form,
    setShowDialog,
    nodeConfig,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    nodeConfigZodSchema,
    isLoading,
    watch,
    nodeLabel,
    nodeId,
    nodeUniqueName,
  } = useCallBlockForm();

  // Watch all form values
  const watchedValues = watch();
  const selectedBlock = watch("selectBlock");

  const renderedInputFields = useMemo(
    () =>
      nodeConfig.filter((field) =>
        shouldRenderField("Input", field, watchedValues),
      ),
    [nodeConfig, watchedValues],
  );

  const renderedOutputFields = useMemo(
    () =>
      nodeConfig.filter((field) =>
        shouldRenderField("Output", field, watchedValues),
      ),
    [nodeConfig, watchedValues],
  );

  const hasSelectedBlock = Boolean(selectedBlock?.id && selectedBlock?.flowId);
  const showInputFields = renderedInputFields.length > 0;
  const showOutputFields = renderedOutputFields.length > 0;

  // Get handlers to update node inputs and outputs
  const { updateNodeDataIO, updateFlowVariablesObject } = useUpdateNodeDataIO();

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof nodeConfigZodSchema>) => {
    const inputKeys = renderedInputFields.map((field) => field.name);
    const outputKeys = renderedOutputFields.map((field) => field.name);

    // Extract node inputs and outputs from formData
    const { inputs, outputs } = refineSubmittedIO(
      nodeUniqueName,
      formData,
      inputKeys,
      outputKeys,
    );

    // Update node data inputs outputs and selectBlock
    if (nodeId) {
      updateNodeDataIO(
        nodeId,
        inputs,
        outputs,
        nodeLabel,
        undefined,
        formData?.selectBlock,
      );

      // Update flow variables object
      if (outputs.length > 0) updateFlowVariablesObject(nodeId, outputs);
    } else {
      toast.error("Node id is undefined. Cannot update node data");
      console.error("Node id is undefined. Cannot update node data.");
    }

    // Close the dialog
    setShowDialog(false);
  };
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
              <AsyncSingleSelectField<
                SearchFlowVersionResDto,
                {
                  type: string;
                  includePublishedOnly: boolean;
                }
              >
                name="selectBlock"
                size="sm"
                label="Select Block"
                description="Select a block"
                placeholder="Search block"
                queryKeyBase={["call-block-search-flow-versions"]}
                fetcher={(query, filters) =>
                  searchFlowVersions(
                    query,
                    filters.type,
                    filters.includePublishedOnly,
                  ).then((res) => res.data || [])
                }
                filters={{ type: "Block", includePublishedOnly: false }}
                getItemId={(item) => item.id}
                getItemLabel={(item) =>
                  `${item.name} - v${item.versionNumber ?? "-"}`
                }
              />

              {isLoading ? (
                <div className="mt-1 rounded-md border border-dashed flex items-center h-64 justify-center">
                  <LoadingSpinner className="h-5 w-5 text-primary" />
                </div>
              ) : (
                <>
                  {!hasSelectedBlock ? (
                    <div className="mt-1 rounded-md border border-dashed bg-muted/30 px-3.5 py-2.5 text-sm text-muted-foreground">
                      Select a block to configure its inputs and outputs.
                    </div>
                  ) : (
                    <>
                      {/* Input fields */}
                      {showInputFields ? (
                        <div className="mt-1 space-y-3.5">
                          {renderedInputFields.map((field) => (
                            <RenderField key={field.name} {...field} />
                          ))}
                        </div>
                      ) : (
                        <div className="mt-1 rounded-md border border-dashed bg-muted/30 px-3.5 py-2.5 text-sm text-muted-foreground">
                          This block does not require any inputs.
                        </div>
                      )}

                      {/* Output fields */}
                      <h3 className="!mt-6 flex items-center gap-1 text-sm font-medium">
                        <span className="rounded-full bg-accent px-1.5 text-indigo-600">
                          Outputs
                        </span>
                        <span className="h-[0.06rem] flex-grow rounded bg-accent"></span>
                      </h3>

                      {showOutputFields ? (
                        <>
                          <div className="space-y-3 rounded-lg border bg-slate-50 px-3.5 py-3">
                            {renderedOutputFields.map((field) => (
                              <RenderField key={field.name} {...field} />
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="rounded-md border border-dashed bg-muted/30 px-3.5 py-2.5 text-sm text-muted-foreground">
                          This block does not produce any outputs.
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </DCPTabsContent>
          {/* Save button */}
          <DCPTabsFooterWrapper
            className={cn(isAgentHistory && "justify-between")}
          >
            {isAgentHistory ? (
              <div className="flex items-center gap-1 text-muted-foreground">
                <InfoIcon className="h-3.5 w-3.5" />
                <span className="mt-0.5 text-xs">
                  Changes will not be saved
                </span>
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
    </>
  );
};

export default CallBlockConfigForm;
