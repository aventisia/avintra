import { useFormContext } from "react-hook-form";

import { GroupedFieldsWrapper } from "@/features/dynamic-config-panel/components/fields-for-form/GroupedFieldsWrapper";
import { ModelConfigField } from "@/features/dynamic-config-panel/components/fields-for-form/ModelConfigField";

import { VOICE_FIELDS } from "../constants/voice-builder.constant";
import { VoiceOutputFields } from "./VoiceOutputFields";

const PROVIDER = `${VOICE_FIELDS.textToSpeech}.provider`;
const MODEL = `${VOICE_FIELDS.textToSpeech}.model`;
const CREDENTIAL = `${VOICE_FIELDS.textToSpeech}.credential_name`;
const IS_BYOK = `${VOICE_FIELDS.textToSpeech}.is_byok_enabled`;

export const VoiceTtsSection = () => {
  const { watch } = useFormContext();

  return (
    <GroupedFieldsWrapper groupName="Text-to-Speech (TTS)">
      <ModelConfigField
        name={VOICE_FIELDS.textToSpeech}
        specialty="tts"
        showJsonOutput={false}
        hideByok
        hideVoiceConfig
        hideGroup
      />
      <VoiceOutputFields
        provider={watch(PROVIDER) as string | undefined}
        model={watch(MODEL) as string | undefined}
        capability="tts"
        credentialName={watch(CREDENTIAL) as string | undefined}
        isByokEnabled={watch(IS_BYOK) as boolean | undefined}
        emptyMessage="Pick a text-to-speech provider above to see its voices."
      />
    </GroupedFieldsWrapper>
  );
};
