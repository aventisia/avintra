import { LoadingSpinner } from "@avplatform/ui";
import { AsyncSingleSelectField, Form } from "@avplatform/ui/form";
import { InfoIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { FieldValues, UseFormReturn } from "react-hook-form";

import { searchFlowVersions } from "@/apis/search-flow-versions-api";
import { SearchFlowVersionResDto } from "@/dtos/search-flow-version-res-dto";
import {
  RenderField,
  shouldRenderField,
  useRegisterFormFlush,
} from "@/features/dynamic-config-panel";
import { DCPTabsContent } from "@/features/dynamic-config-panel/components/dcp-tabs/DCPTabsContent";
import { DCPTabsFooterWrapper } from "@/features/dynamic-config-panel/components/dcp-tabs/DCPTabsFooterWrapper";
import { DCPTabsList } from "@/features/dynamic-config-panel/components/dcp-tabs/DCPTabsList";
import { DCPTabsListWrapper } from "@/features/dynamic-config-panel/components/dcp-tabs/DCPTabsListWrapper";
import { DCPTabsTrigger } from "@/features/dynamic-config-panel/components/dcp-tabs/DCPTabsTrigger";
import { DCPTabsWrapper } from "@/features/dynamic-config-panel/components/dcp-tabs/DCPTabsWrapper";
import { useFlushNodeConfig } from "@/features/dynamic-config-panel/hooks/useFlushNodeConfig";
import { useIsVersionHistoryRoute } from "@/features/version-history/hooks/useIsVersionHistoryRoute";

import { useCallAgentForm } from "./useCallAgentForm";

const CallAgentConfigForm = () => {
  const [selectedTab, setSelectedTab] = useState("Inputs");
  const isAgentHistory = useIsVersionHistoryRoute();

  const { form, nodeConfig, isLoading, watch, nodeLabel, nodeId, nodeUniqueName, isLabelDirty } =
    useCallAgentForm();

  // Watch all form values
  const watchedValues = watch();
  const selectedAgent = watch("selectAgent");

  const renderedInputFields = useMemo(
    () => nodeConfig.filter((field) => shouldRenderField("Input", field, watchedValues)),
    [nodeConfig, watchedValues],
  );

  const renderedOutputFields = useMemo(
    () => nodeConfig.filter((field) => shouldRenderField("Output", field, watchedValues)),
    [nodeConfig, watchedValues],
  );

  const hasSelectedAgent = Boolean(selectedAgent?.id && selectedAgent?.flowId);
  const showInputFields = renderedInputFields.length > 0;
  const showOutputFields = renderedOutputFields.length > 0;

  /** Commits the open config form into the canvas store at panel boundaries. */
  const { flushNow } = useFlushNodeConfig({
    form: form as unknown as UseFormReturn<FieldValues>,
    nodeId,
    nodeUniqueName,
    inputKeys: renderedInputFields.map((field) => field.name),
    outputKeys: renderedOutputFields.map((field) => field.name),
    nodeLabel,
    isLabelDirty,
    extras: { selectAgent: form.getValues()?.selectAgent ?? null },
  });

  useRegisterFormFlush(flushNow);

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
            void flushNow();
          }}
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
                name="selectAgent"
                size="sm"
                label="Select Agent"
                description="Select an agent"
                placeholder="Search agent"
                queryKeyBase={["call-agent-search-flow-versions"]}
                fetcher={(query, filters) =>
                  searchFlowVersions(query, filters.type, filters.includePublishedOnly).then(
                    (res) => res.data || [],
                  )
                }
                filters={{ type: "Agent", includePublishedOnly: false }}
                getItemId={(item) => item.id}
                getItemLabel={(item) => `${item.name} - v${item.versionNumber ?? "-"}`}
              />

              {isLoading ? (
                <div className="mt-1 rounded-md border border-dashed flex h-64 items-center justify-center">
                  <LoadingSpinner className="h-5 w-5 text-primary" />
                </div>
              ) : (
                <>
                  {!hasSelectedAgent ? (
                    <div className="mt-1 rounded-md border border-dashed bg-muted/30 px-3.5 py-2.5 text-sm text-muted-foreground">
                      Select an agent to configure its inputs and outputs.
                    </div>
                  ) : (
                    <>
                      {showInputFields ? (
                        <div className="mt-1 space-y-3.5">
                          {renderedInputFields.map((field) => (
                            <RenderField key={field.name} {...field} />
                          ))}
                        </div>
                      ) : (
                        <div className="mt-1 rounded-md border border-dashed bg-muted/30 px-3.5 py-2.5 text-sm text-muted-foreground">
                          This agent does not require any inputs.
                        </div>
                      )}

                      <h3 className="!mt-6 flex items-center gap-1 text-sm font-medium">
                        <span className="rounded-full bg-accent px-1.5 text-indigo-600">
                          Outputs
                        </span>
                        <span className="h-[0.06rem] flex-grow rounded bg-accent"></span>
                      </h3>

                      {showOutputFields ? (
                        <div className="space-y-3 rounded-lg border bg-slate-50 px-3.5 py-3">
                          {renderedOutputFields.map((field) => (
                            <RenderField key={field.name} {...field} />
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-md border border-dashed bg-muted/30 px-3.5 py-2.5 text-sm text-muted-foreground">
                          This agent does not produce any outputs.
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </DCPTabsContent>
          {/* Changes auto-commit at panel boundaries */}
          {isAgentHistory ? (
            <DCPTabsFooterWrapper className="justify-between">
              <div className="flex items-center gap-1 text-muted-foreground">
                <InfoIcon className="h-3.5 w-3.5" />
                <span className="mt-0.5 text-xs">Changes will not be saved</span>
              </div>
            </DCPTabsFooterWrapper>
          ) : null}
        </Form>
      </DCPTabsWrapper>
    </>
  );
};

export default CallAgentConfigForm;
