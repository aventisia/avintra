import { Workflow, Zap } from "lucide-react";
import type { ReactNode } from "react";
import { useFormContext } from "react-hook-form";

import { GroupedFieldsWrapper, ModelConfigField } from "@/features/dynamic-config-panel";

import { VOICE_FIELDS } from "../constants/voice-builder.constant";
import { VoiceBuilderSection } from "./VoiceBuilderSection";
import { type VoiceOptionCard, VoiceOptionCards } from "./VoiceOptionCards";
import { VoiceOutputFields } from "./VoiceOutputFields";
import { VoiceTtsSection } from "./VoiceTtsSection";

const ENGINE_OPTIONS: VoiceOptionCard[] = [
  {
    value: "pipeline",
    label: "Pipeline",
    description: "Separate speech-to-text, language model, and text-to-speech steps.",
    Icon: Workflow,
  },
  {
    value: "realtime",
    label: "Realtime",
    description: "One realtime model listens and speaks with lower delay.",
    Icon: Zap,
  },
];

type VoiceBrainSectionProps = {
  renderField: (name: string) => ReactNode;
};

export const VoiceBrainSection = ({ renderField }: VoiceBrainSectionProps) => {
  const { watch, setValue } = useFormContext();
  const engineMode = (watch(VOICE_FIELDS.engineMode) as string | undefined) ?? "pipeline";
  const isRealtime = engineMode === "realtime";
  const realtime =
    (watch(VOICE_FIELDS.realtimeModel) as
      | {
          provider?: string;
          model?: string;
          credential_name?: string;
          is_byok_enabled?: boolean;
        }
      | undefined) ?? {};

  return (
    <VoiceBuilderSection
      id="brain"
      title="Brain"
      description="The engine and models that hear, think, and answer."
    >
      <VoiceOptionCards
        ariaLabel="Engine"
        value={engineMode}
        options={ENGINE_OPTIONS}
        onChange={(value) => setValue(VOICE_FIELDS.engineMode, value, { shouldDirty: true })}
      />

      {isRealtime ? (
        <GroupedFieldsWrapper groupName="Realtime Voice">
          <ModelConfigField
            name={VOICE_FIELDS.realtimeModel}
            showJsonOutput={false}
            hideByok
            hideVoiceConfig
            hideGroup
          />
          <VoiceOutputFields
            provider={realtime.provider}
            model={realtime.model}
            capability="realtime"
            credentialName={realtime.credential_name}
            isByokEnabled={realtime.is_byok_enabled}
            showPreview={false}
            emptyMessage="Pick a supported realtime provider above to see its voices."
          />
        </GroupedFieldsWrapper>
      ) : (
        <>
          {renderField(VOICE_FIELDS.languageModel)}
          <VoiceTtsSection />
          {renderField(VOICE_FIELDS.speechToText)}
        </>
      )}
    </VoiceBuilderSection>
  );
};
