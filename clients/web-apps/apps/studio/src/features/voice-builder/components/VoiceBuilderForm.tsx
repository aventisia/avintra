import { LoadingSpinner } from "@avplatform/ui";
import { Form } from "@avplatform/ui/form";
import { Tabs } from "@avplatform/ui/tabs";
import { useEffect, useMemo } from "react";

import {
  ModelConfigField,
  PromptConfigFieldV2,
  RenderField,
  VoicePronunciationTab,
  VoiceVariablesField,
  useDefineDCPForm,
} from "@/features/dynamic-config-panel";

import { VOICE_FIELDS } from "../constants/voice-builder.constant";
import { useVoiceBuilderStore } from "../stores/voice-builder.store";
import type { VoiceBuilderSectionId } from "../types/voice-builder.type";
import { getPendingVoiceChecks, getVoiceReadiness } from "../utils/voice-builder.util";
import { VoiceBuilderSection } from "./VoiceBuilderSection";
import { VoiceEngineSection } from "./VoiceEngineSection";
import { VoicePromptSection } from "./VoicePromptSection";
import { VoiceSectionTabs } from "./VoiceSectionTabs";

/** Voice agent settings in tabs like the node config panel, bound to the saved voice node through the node config form. */
export const VoiceBuilderForm = () => {
  const { form, watch, flushNow, nodeConfig, isFormReady, isLoading } = useDefineDCPForm();
  const activeSection = useVoiceBuilderStore((state) => state.activeSection);
  const setActiveSection = useVoiceBuilderStore((state) => state.setActiveSection);
  const values = watch();
  const readiness = getVoiceReadiness(values);

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

  const fieldsByName = useMemo(
    () => new Map(nodeConfig.fields.map((field) => [field.name, field])),
    [nodeConfig.fields],
  );

  const renderField = (name: string) => {
    const field = fieldsByName.get(name);
    return field ? <RenderField key={name} {...field} /> : null;
  };

  const renderPromptEditor = (name: string) => {
    const field = fieldsByName.get(name);
    return field ? (
      <PromptConfigFieldV2 key={name} name={field.name} disabled={field.disabled} height="16rem" />
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

  if (isLoading || !isFormReady) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner className="size-5 text-primary" />
      </div>
    );
  }

  const variablesConfig = fieldsByName.get(VOICE_FIELDS.variables);

  const variablesField = (
    <VoiceVariablesField
      name={VOICE_FIELDS.variables}
      disabled={values[VOICE_FIELDS.variablesEnabled] !== true}
      label={variablesConfig?.label}
      description={variablesConfig?.description}
      size="sm"
    />
  );

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
          <VoicePromptSection
            renderField={renderField}
            renderPromptEditor={renderPromptEditor}
            variablesField={variablesField}
          />
          <VoiceEngineSection renderModelField={renderModelField} />
          <VoiceBuilderSection id="context">
            {renderField(VOICE_FIELDS.knowledgeBases)}
            {renderField(VOICE_FIELDS.skills)}
            {renderField(VOICE_FIELDS.memory)}
          </VoiceBuilderSection>
          <VoiceBuilderSection id="tools">{renderField(VOICE_FIELDS.tools)}</VoiceBuilderSection>
          <VoiceBuilderSection id="pronunciation">
            <VoicePronunciationTab />
          </VoiceBuilderSection>
        </Form>
      </div>
    </Tabs>
  );
};
