import { LoadingSpinner } from "@avplatform/ui";
import { Form } from "@avplatform/ui/form";
import { cn } from "@avplatform/ui/lib";
import { FlaskIcon, InfoIcon, MagnifyingGlassIcon, PlayIcon } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import ImproveWithAIButton from "@/features/dynamic-config-panel/components/dcp-tabs/ImproveWithAIButton";
import { VOICE_AGENT_PERSONA_FIELD_NAMES } from "@/features/dynamic-config-panel/utils/voice-agent-prompt-sections.util";
import { VOICE_AGENT_NODE_NAME } from "@/features/react-flow/utils/voice-agent-graph.util";
import { useIsVersionHistoryRoute } from "@/features/version-history/hooks/useIsVersionHistoryRoute";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

import { RenderField, shouldRenderField, useDefineDCPForm } from "..";
import { DCPTabsContent } from "./dcp-tabs/DCPTabsContent";
import { DCPTabsFooterWrapper } from "./dcp-tabs/DCPTabsFooterWrapper";
import { DCPTabsList } from "./dcp-tabs/DCPTabsList";
import { DCPTabsListWrapper } from "./dcp-tabs/DCPTabsListWrapper";
import { DCPTabsTrigger } from "./dcp-tabs/DCPTabsTrigger";
import { DCPTabsWrapper } from "./dcp-tabs/DCPTabsWrapper";
import TestTabContent from "./dcp-tabs/node-test-tab/TestTabContent";
import { VoiceAgentPromptAction } from "./fields-for-form/prompt-field/VoiceAgentPromptAction";

export const DCPForm = () => {
  const [showOuputFields, setShowOutputFields] = useState(false);

  const isAgentHistory = useIsVersionHistoryRoute();

  // ChatAgent renders its prompt action in the prompt editor header instead of the tab footer.
  const { isChatAgent } = useCurrentFlowStore(
    useShallow((state) => ({
      isChatAgent: state.isChatAgent,
    })),
  );

  // Define form
  const {
    form,
    watch,
    flushNow,
    nodeConfig,
    isFormReady,
    nodeUniqueName,
    inputKeys,
    outputKeys,
    isLoading,
    selectedTab,
    setSelectedTab,
    tabKeys,
  } = useDefineDCPForm();

  // Watch all form values
  const watchedValues = watch();

  // Commit the current tab's edits before switching to another tab so the Test
  // tab always sees the latest values. Always persists, even incomplete/invalid.
  const handleTabChange = (tab: string) => {
    void flushNow();
    setSelectedTab(tab);
  };

  // Check if output fields should be shown based on node configuration and watched values
  useEffect(() => {
    const renderedOutputFields = nodeConfig?.fields?.filter((field) =>
      shouldRenderField("Output", field, watchedValues),
    );

    setShowOutputFields(Number(renderedOutputFields?.map((field) => field.name)?.length) > 0);
  }, [nodeConfig?.fields, isFormReady, nodeConfig, watchedValues]);

  // The renderable prompt field on the currently selected tab. Used to offer
  // the Improve with AI action without hard-coding the tab name.
  const promptField = useMemo(
    () =>
      nodeConfig?.fields?.find(
        (field) =>
          (field.type === "prompt-input" || field.type === "prompt-input-v2") &&
          (field.category ?? "Inputs") === selectedTab &&
          shouldRenderField("Input", field, watchedValues),
      ),
    [nodeConfig?.fields, selectedTab, watchedValues],
  );

  // The VoiceAgent persona tab hosts the Generate/Improve action for the
  // Goal/Role/Instructions fields.
  const voicePersonaTab = useMemo(() => {
    if (nodeUniqueName !== VOICE_AGENT_NODE_NAME) return null;

    const personaField = nodeConfig?.fields?.find((field) =>
      VOICE_AGENT_PERSONA_FIELD_NAMES.includes(field.name),
    );

    return personaField ? (personaField.category ?? "Inputs") : null;
  }, [nodeUniqueName, nodeConfig?.fields]);

  const isVoicePersonaTab = voicePersonaTab !== null && selectedTab === voicePersonaTab;

  // Return the form
  return (
    <>
      {isLoading ? (
        <div className="flex h-full items-center justify-center gap-2 text-sm">
          <LoadingSpinner className="h-5 w-5 text-primary" />
        </div>
      ) : !isFormReady ? (
        <div className="flex h-full items-center justify-center gap-2 text-sm">
          <MagnifyingGlassIcon className="text-icon h-5 w-5" />
          Configuration not found for this node.
        </div>
      ) : (
        <DCPTabsWrapper setTabValue={handleTabChange} tabValue={selectedTab}>
          <DCPTabsListWrapper>
            <DCPTabsList>
              {tabKeys?.map((key) => (
                <DCPTabsTrigger tabValue={key} children={key.replace(/([a-z])([A-Z])/g, "$1 $2")} />
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
                          void flushNow();
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
                          void flushNow();
                        }}
                      >
                        <FlaskIcon className="h-3.5 w-3.5" />
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
                        flushNow();
                      }}
                    >
                      <FlaskIcon className="h-3.5 w-3.5" />
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
              void flushNow();
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
                        <span className="rounded-full bg-fill px-1.5 py-1 text-xs font-medium text-ink-2">
                          Outputs
                        </span>
                      </div>
                    </h3>

                    <div className="mb-1 mt-3 space-y-3 rounded-lg border bg-sunken px-3.5 py-3">
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

            {/* Prompt helpers / history notice. Changes auto-commit at panel boundaries. */}
            {selectedTab !== "Test" &&
              (isAgentHistory || isVoicePersonaTab || (promptField && !isChatAgent)) && (
                <DCPTabsFooterWrapper className={cn("justify-between")}>
                  {isVoicePersonaTab && !isAgentHistory && <VoiceAgentPromptAction />}

                  {promptField && !isAgentHistory && !isChatAgent && (
                    <ImproveWithAIButton
                      disabled={isAgentHistory}
                      name={promptField.name}
                      form={form}
                    />
                  )}

                  {isAgentHistory ? (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <InfoIcon className="h-3.5 w-3.5" />
                      <span className="mt-0.5 text-xs">Changes will not be saved</span>
                    </div>
                  ) : null}
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
