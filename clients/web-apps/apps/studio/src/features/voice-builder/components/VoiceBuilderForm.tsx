import { LoadingSpinner } from "@avplatform/ui";
import { Form } from "@avplatform/ui/form";
import { Tabs } from "@avplatform/ui/tabs";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useEffect, useMemo } from "react";
import { useWatch } from "react-hook-form";

import {
  ConfigPanelAutosizeTextareaField,
  ModelConfigField,
  RenderField,
  ToolsConfigField,
  VoicePronunciationTab,
  stableStringify,
  useDefineDCPForm,
} from "@/features/dynamic-config-panel";

import { VOICE_FIELDS } from "../constants/voice-builder.constant";
import { useVoiceBuilderStore } from "../stores/voice-builder.store";
import type { VoiceBuilderSectionId, VoiceEngineMode } from "../types/voice-builder.type";
import {
  getPendingVoiceChecks,
  getVoiceReadiness,
  resetInactiveEngineModels,
} from "../utils/voice-builder.util";
import { VoiceBuilderSection } from "./VoiceBuilderSection";
import { VoiceContextSection } from "./VoiceContextSection";
import { VoiceEngineSection } from "./VoiceEngineSection";
import { VoicePromptSection } from "./VoicePromptSection";
import { VoiceSectionTabs } from "./VoiceSectionTabs";
import { VoiceTabHeading } from "./VoiceTabHeading";

/** Voice agent settings in tabs like the node config panel, bound to the saved voice node through the node config form. */
export const VoiceBuilderForm = () => {
  // IMPORTANT NOTE: both engines share one saved node, so a save empties the engine that is not
  // selected to keep one set of provider, model, and credential; its voice stays for later.
  const { form, watch, flushNow, nodeConfig, isFormReady, isLoading, hasLoadError } =
    useDefineDCPForm({
      beforeFlush: (next) => resetInactiveEngineModels(next),
    });

  const activeSection = useVoiceBuilderStore((state) => state.activeSection);
  const setActiveSection = useVoiceBuilderStore((state) => state.setActiveSection);
  const values = watch();
  const readiness = getVoiceReadiness(values);
  const engineMode = (values[VOICE_FIELDS.engineMode] as VoiceEngineMode | undefined) ?? "pipeline";
  const activeVoiceConfigName =
    engineMode === "realtime" ? VOICE_FIELDS.realtimeVoiceConfig : VOICE_FIELDS.pipelineVoiceConfig;
  const activeVoiceConfig = useWatch({ control: form.control, name: activeVoiceConfigName });

  const setPendingChecks = useVoiceBuilderStore((state) => state.setPendingChecks);
  const bumpConfigRevision = useVoiceBuilderStore((state) => state.bumpConfigRevision);
  const resetVoiceBuilder = useVoiceBuilderStore((state) => state.reset);
  const pendingKey = isFormReady
    ? readiness
        .filter((check) => !check.isReady)
        .map((check) => `${check.section}:${check.hint}`)
        .join("|")
    : null;

  useEffect(() => resetVoiceBuilder, [resetVoiceBuilder]);

  useEffect(() => {
    if (pendingKey === null) return;
    setPendingChecks(getPendingVoiceChecks(form.getValues()));
  }, [form, pendingKey, setPendingChecks]);

  useEffect(() => {
    const subscription = watch(() => bumpConfigRevision());
    return () => subscription.unsubscribe();
  }, [watch, bumpConfigRevision]);

  // IMPORTANT NOTE: the runtime reads one voice setting for both engines, so the active
  // engine's choice is mirrored there while each engine keeps its own saved copy.
  useEffect(() => {
    if (!isFormReady || !activeVoiceConfig) return;
    const shared = form.getValues(VOICE_FIELDS.voiceConfig);
    if (stableStringify(shared) === stableStringify(activeVoiceConfig)) return;
    form.setValue(VOICE_FIELDS.voiceConfig, { ...activeVoiceConfig }, { shouldDirty: false });
  }, [activeVoiceConfig, form, isFormReady]);

  const fieldsByName = useMemo(
    () => new Map(nodeConfig.fields.map((field) => [field.name, field])),
    [nodeConfig.fields],
  );

  const renderField = (name: string) => {
    const field = fieldsByName.get(name);
    return field ? <RenderField key={name} {...field} /> : null;
  };

  const renderPromptField = (name: string) => {
    const field = fieldsByName.get(name);
    return field ? (
      <ConfigPanelAutosizeTextareaField
        key={name}
        name={field.name}
        label={field.label}
        description={field.description}
        disabled={field.disabled}
        minHeight={0}
        hideVariablesTrigger
      />
    ) : null;
  };

  const renderModelField = (name: string) => {
    const field = fieldsByName.get(name);
    return field ? (
      <ModelConfigField
        key={name}
        name={field.name}
        showJsonOutput={field.showJsonOutput}
        specialty={field.specialty}
        hideByok={field.hideByok}
        hideGroup
        inline
      />
    ) : null;
  };

  if (hasLoadError) {
    return (
      <div className="flex h-full items-center justify-center gap-2 text-sm">
        <MagnifyingGlassIcon aria-hidden="true" className="text-icon h-5 w-5" />
        Configuration not found for this node.
      </div>
    );
  }

  if (isLoading || !isFormReady) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner label="Loading agent settings" className="size-5 text-primary" />
      </div>
    );
  }

  return (
    <Tabs
      value={activeSection}
      onValueChange={(value) => setActiveSection(value as VoiceBuilderSectionId)}
      className="flex h-full min-h-0 flex-col"
    >
      <VoiceSectionTabs readiness={readiness} />
      <div className="min-h-0 flex-1 [&>form]:h-full">
        <Form
          methods={form}
          className="h-full min-h-0 gap-0"
          onSubmit={(event) => {
            event.preventDefault();
            void flushNow();
          }}
        >
          <VoicePromptSection renderField={renderField} renderPromptField={renderPromptField} />
          <VoiceEngineSection renderModelField={renderModelField} />
          <VoiceContextSection hasField={(name) => fieldsByName.has(name)} />
          <VoiceBuilderSection
            id="tools"
            intro={
              <div className="space-y-1">
                <VoiceTabHeading label="Tools" title="What the agent can do during a call" />
                <p className="text-hint text-muted-foreground">
                  Each tool connects to an app with a credential, limited to the actions you pick.
                </p>
              </div>
            }
          >
            {fieldsByName.has(VOICE_FIELDS.tools) && (
              <ToolsConfigField name={VOICE_FIELDS.tools} lockApprovalToAuto hideGroup />
            )}
          </VoiceBuilderSection>
          <VoiceBuilderSection
            id="pronunciation"
            intro={
              <div className="space-y-1">
                <VoiceTabHeading label="Pronunciation" title="How the agent says tricky words" />
                <p className="text-hint text-muted-foreground">
                  Teach it product names, acronyms and jargon so it never stumbles on them.
                </p>
              </div>
            }
          >
            <VoicePronunciationTab />
          </VoiceBuilderSection>
        </Form>
      </div>
    </Tabs>
  );
};
