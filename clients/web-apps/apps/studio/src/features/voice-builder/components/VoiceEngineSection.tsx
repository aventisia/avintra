import { BrainIcon, EarIcon, LightningIcon, SpeakerHighIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useFormContext } from "react-hook-form";

import { ModelConfigField } from "@/features/dynamic-config-panel";

import { VOICE_FIELDS } from "../constants/voice-builder.constant";
import type { VoiceRealtimeModelConfig } from "../types/voice-builder.type";
import { getEngineStepReadiness, isRealtimeReady } from "../utils/voice-builder.util";
import { VoiceBuilderSection } from "./VoiceBuilderSection";
import { VoiceEngineModePicker } from "./VoiceEngineModePicker";
import { VoiceOutputFields } from "./VoiceOutputFields";
import { VoiceStage } from "./VoiceStage";
import { VoiceTtsSection } from "./VoiceTtsSection";

type VoiceEngineSectionProps = {
  /** Renders a model picker without its group frame, with its pickers side by side. */
  renderModelField: (name: string) => ReactNode;
};

/** Engine tab: the engine choice, then each stage of the call on a pipeline rail. */
export const VoiceEngineSection = ({ renderModelField }: VoiceEngineSectionProps) => {
  const { watch, setValue } = useFormContext();
  const values = watch();
  const engineMode = (values[VOICE_FIELDS.engineMode] as string | undefined) ?? "pipeline";
  const steps = getEngineStepReadiness(values);
  const realtime =
    (values[VOICE_FIELDS.realtimeModel] as VoiceRealtimeModelConfig | undefined) ?? {};

  return (
    <VoiceBuilderSection
      id="engine"
      intro={
        <VoiceEngineModePicker
          value={engineMode}
          onChange={(value) => setValue(VOICE_FIELDS.engineMode, value, { shouldDirty: true })}
        />
      }
    >
      <ol aria-label="Call stages" className="pt-1">
        {engineMode === "realtime" ? (
          <VoiceStage
            Icon={LightningIcon}
            role="All in one"
            title="Realtime model"
            description="One model listens, thinks, and speaks, so replies come back faster."
            mark={isRealtimeReady(values) ? "ready" : "todo"}
          >
            <div className="space-y-3">
              <ModelConfigField
                name={VOICE_FIELDS.realtimeModel}
                showJsonOutput={false}
                hideByok
                hideVoiceConfig
                hideGroup
                inline
              />
              <VoiceOutputFields
                provider={realtime.provider}
                model={realtime.model}
                capability="realtime"
                credentialName={realtime.credential_name}
                isByokEnabled={realtime.is_byok_enabled}
                showPreview={false}
                emptyMessage="Pick a supported realtime model above to see its voices."
              />
            </div>
          </VoiceStage>
        ) : (
          <>
            <VoiceStage
              Icon={EarIcon}
              role="Hears"
              title="Speech-to-text"
              description="Turns what the caller says into text."
              hasNext
              mark={steps.speechToText ? "ready" : "todo"}
            >
              {renderModelField(VOICE_FIELDS.speechToText)}
            </VoiceStage>
            <VoiceStage
              Icon={BrainIcon}
              role="Thinks"
              title="Language model"
              description="Reads the transcript and writes the reply."
              hasNext
              mark={steps.languageModel ? "ready" : "todo"}
            >
              {renderModelField(VOICE_FIELDS.languageModel)}
            </VoiceStage>
            <VoiceStage
              Icon={SpeakerHighIcon}
              role="Speaks"
              title="Text-to-speech"
              description="Reads the reply aloud in the voice you pick."
              mark={steps.voice ? "ready" : "todo"}
            >
              <VoiceTtsSection />
            </VoiceStage>
          </>
        )}
      </ol>
    </VoiceBuilderSection>
  );
};
