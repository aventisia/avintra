import { ModelConfigField } from "@/features/dynamic-config-panel/components/fields-for-form/ModelConfigField";

import { VOICE_FIELDS } from "../constants/voice-builder.constant";
import { VoiceBuilderSection } from "./VoiceBuilderSection";
import { VoiceTtsSection } from "./VoiceTtsSection";

export const VoiceBrainSection = () => (
  <VoiceBuilderSection
    id="brain"
    title="Brain"
    description="The engine and models that hear, think, and answer."
  >
    <ModelConfigField name={VOICE_FIELDS.languageModel} showJsonOutput={false} hideByok />

    <VoiceTtsSection />

    <ModelConfigField
      name={VOICE_FIELDS.speechToText}
      specialty="stt"
      showJsonOutput={false}
      hideByok
    />
  </VoiceBuilderSection>
);
