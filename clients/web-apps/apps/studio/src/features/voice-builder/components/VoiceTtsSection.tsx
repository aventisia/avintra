import { useFormContext } from "react-hook-form";

import { ModelConfigField } from "@/features/dynamic-config-panel/components/fields-for-form/ModelConfigField";

import { VOICE_FIELDS } from "../constants/voice-builder.constant";
import { VoiceOutputFields } from "./VoiceOutputFields";

const PROVIDER = `${VOICE_FIELDS.textToSpeech}.provider`;
const MODEL = `${VOICE_FIELDS.textToSpeech}.model`;
const CREDENTIAL = `${VOICE_FIELDS.textToSpeech}.credential_name`;

export const VoiceTtsSection = () => {
  const { watch } = useFormContext();

  return (
    <div className="space-y-3">
      <ModelConfigField
        name={VOICE_FIELDS.textToSpeech}
        specialty="tts"
        showJsonOutput={false}
        hideByok
        hideVoiceConfig
        hideGroup
        inline
      />
      <VoiceOutputFields
        mode="pipeline"
        provider={watch(PROVIDER) as string | undefined}
        model={watch(MODEL) as string | undefined}
        capability="tts"
        credentialName={watch(CREDENTIAL) as string | undefined}
        emptyMessage="Pick a text-to-speech model above to see its voices."
      />
    </div>
  );
};
