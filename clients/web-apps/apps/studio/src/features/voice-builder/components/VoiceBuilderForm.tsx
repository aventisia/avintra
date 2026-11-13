import { LoadingSpinner } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import { Form } from "@avplatform/ui/form";
import { CheckCircleIcon, CircleIcon, ClockIcon } from "@phosphor-icons/react";
import { useMemo } from "react";

import { RenderField, useDefineDCPForm } from "@/features/dynamic-config-panel";
import { VoiceFeatureCard } from "@/features/dynamic-config-panel/components/fields-for-form/VoiceFeatureCard";
import { VoicePronunciationTab } from "@/features/dynamic-config-panel/components/fields-for-form/VoicePronunciationTab";
import { VoiceVariablesField } from "@/features/dynamic-config-panel/components/fields-for-form/VoiceVariablesField";

import {
  VOICE_BUILDER_SECTIONS,
  VOICE_COMING_LATER,
  VOICE_FIELDS,
} from "../constants/voice-builder.constant";
import type { VoiceBuilderSectionId, VoiceReadinessCheck } from "../types/voice-builder.type";
import { getVoiceReadiness, getVoiceSectionElementId } from "../utils/voice-builder.util";
import { VoiceBrainSection } from "./VoiceBrainSection";
import { VoiceBuilderSection } from "./VoiceBuilderSection";
import { VoiceOpeningSection } from "./VoiceOpeningSection";
import { VoicePersonaSection } from "./VoicePersonaSection";

const scrollToSection = (id: VoiceBuilderSectionId) => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document
    .getElementById(getVoiceSectionElementId(id))
    ?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
};

const SectionRail = ({ readiness }: { readiness: VoiceReadinessCheck[] }) => (
  <nav
    aria-label="Builder sections"
    className="hidden w-52 shrink-0 border-r border-line p-3 xl:block"
  >
    <ul className="sticky top-0 space-y-0.5">
      {VOICE_BUILDER_SECTIONS.map((section) => {
        const check = readiness.find((item) => item.section === section.id);
        return (
          <li key={section.id}>
            <button
              type="button"
              onClick={() => scrollToSection(section.id)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-body-sm text-ink-2 hover:bg-hover hover:text-ink focus-visible:shadow-focus focus-visible:outline-none"
            >
              {check?.isReady && <CheckCircleIcon aria-label="Done" className="size-3.5 text-ok" />}
              {check && !check.isReady && (
                <CircleIcon aria-label="To do" className="size-3.5 text-warn" />
              )}
              {!check && <span aria-hidden="true" className="size-3.5" />}
              {section.label}
            </button>
          </li>
        );
      })}
    </ul>
  </nav>
);

const ReadinessCard = ({ readiness }: { readiness: VoiceReadinessCheck[] }) => {
  const remaining = readiness.filter((check) => !check.isReady).length;

  return (
    <section
      aria-labelledby="voice-readiness-title"
      className="rounded-xl border border-line bg-surface p-4"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h2 id="voice-readiness-title" className="text-heading text-ink">
          {remaining
            ? `${remaining} ${remaining === 1 ? "thing" : "things"} to finish`
            : "Ready to test"}
        </h2>
        <Badge variant={remaining ? "queued" : "completed"}>
          {readiness.length - remaining}/{readiness.length}
        </Badge>
        <span className="ml-auto text-hint text-muted-foreground">
          Publish also checks these models are enabled for your tenant.
        </span>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {readiness.map((check) => (
          <li key={check.section}>
            <button
              type="button"
              onClick={() => scrollToSection(check.section)}
              className="flex w-full items-start gap-2 rounded-lg bg-sunken px-3 py-2 text-left hover:bg-hover focus-visible:shadow-focus focus-visible:outline-none"
            >
              {check.isReady ? (
                <CheckCircleIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-ok" />
              ) : (
                <CircleIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-warn" />
              )}
              <span>
                <span className="block text-body-sm font-semibold text-ink">{check.label}</span>
                <span className="block text-hint text-muted-foreground">
                  {check.isReady ? "Done" : check.hint}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};

/** One-page voice agent settings, bound to the saved voice node through the node config form. */
export const VoiceBuilderForm = () => {
  const { form, watch, flushNow, nodeConfig, isFormReady, isLoading } = useDefineDCPForm();
  const values = watch();
  const readiness = getVoiceReadiness(values);

  const fieldsByName = useMemo(
    () => new Map(nodeConfig.fields.map((field) => [field.name, field])),
    [nodeConfig.fields],
  );

  const renderField = (name: string) => {
    const field = fieldsByName.get(name);
    return field ? <RenderField key={name} {...field} /> : null;
  };

  if (isLoading || !isFormReady) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner className="size-5 text-primary" />
      </div>
    );
  }

  const variablesToggle = fieldsByName.get(VOICE_FIELDS.variablesEnabled);
  const variablesField = fieldsByName.get(VOICE_FIELDS.variables);

  return (
    <div className="flex h-full min-h-0">
      <SectionRail readiness={readiness} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Form
          methods={form}
          className="mx-auto max-w-3xl gap-4 px-6 py-6"
          onSubmit={(event) => {
            event.preventDefault();
            void flushNow();
          }}
        >
          <ReadinessCard readiness={readiness} />
          <VoicePersonaSection renderField={renderField} />
          <VoiceOpeningSection renderField={renderField} />
          <VoiceBrainSection renderField={renderField} />

          <VoiceBuilderSection
            id="knowledge"
            title="Knowledge & tools"
            description="What the agent can look up and the actions it can take during a call."
          >
            {renderField(VOICE_FIELDS.knowledgeBases)}
            {renderField(VOICE_FIELDS.skills)}
            {renderField(VOICE_FIELDS.memory)}
            {renderField(VOICE_FIELDS.tools)}
          </VoiceBuilderSection>

          <VoiceBuilderSection
            id="pronunciation"
            title="Pronunciation & variables"
            description="Say names and terms correctly, and fill {{name}} placeholders for each call."
          >
            <VoicePronunciationTab />
            <VoiceFeatureCard
              title="Dynamic variables"
              description="Fill {{name}} placeholders for each call."
              toggleName={VOICE_FIELDS.variablesEnabled}
              toggleLabel={variablesToggle?.label}
              toggleDescription={variablesToggle?.description}
              fieldNames={[VOICE_FIELDS.variables, VOICE_FIELDS.variablesEnabled]}
            >
              <VoiceVariablesField
                name={VOICE_FIELDS.variables}
                disabled={values[VOICE_FIELDS.variablesEnabled] !== true}
                label={variablesField?.label}
                description={variablesField?.description}
                size="sm"
              />
            </VoiceFeatureCard>
          </VoiceBuilderSection>

          <VoiceBuilderSection
            id="later"
            title="Coming soon"
            description="Planned capabilities, shown so the full shape of the agent is visible."
          >
            <div className="grid gap-3 sm:grid-cols-3">
              {VOICE_COMING_LATER.map((group) => (
                <div
                  key={group.phase}
                  className="rounded-lg border border-dashed border-line-strong p-3"
                >
                  <Badge variant="draft" className="mb-2">
                    {group.phase}
                  </Badge>
                  <ul className="space-y-1">
                    {group.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-1.5 text-body-sm text-muted-foreground"
                      >
                        <ClockIcon aria-hidden="true" className="size-3.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </VoiceBuilderSection>
        </Form>
      </div>
    </div>
  );
};
