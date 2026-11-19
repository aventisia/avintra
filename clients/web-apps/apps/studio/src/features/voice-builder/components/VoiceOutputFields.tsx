import { SelectField } from "@avplatform/ui/form";
import { useFormContext } from "react-hook-form";

import { SliderField } from "@/components/Slider/SliderField";
import { type VoiceCatalogCapability, useVoiceCatalog } from "@/features/dynamic-config-panel";

import { VOICE_OUTPUT_FIELDS } from "../constants/voice-builder.constant";
import { useVoiceOutputReset } from "../hooks/useVoiceOutputReset.hook";
import { VoicePickerField, type VoicePreviewRequest } from "./VoicePickerField";

type VoiceOutputFieldsProps = {
  provider?: string;
  model?: string;
  capability: VoiceCatalogCapability;
  credentialName?: string;
  showPreview?: boolean;
  emptyMessage: string;
};

export const VoiceOutputFields = ({
  provider,
  model,
  capability,
  credentialName,
  showPreview = true,
  emptyMessage,
}: VoiceOutputFieldsProps) => {
  const { watch } = useFormContext();
  const language = watch(VOICE_OUTPUT_FIELDS.language) as string | undefined;
  const selectedVoice = watch(VOICE_OUTPUT_FIELDS.voice) as string | undefined;
  const pronunciations = watch("__Pronunciation__Voice") as unknown;
  // IMPORTANT NOTE: the attached credential alone decides BYOK, so a blank or whitespace name is the platform path.
  const activeCredential = String(credentialName ?? "").trim() || undefined;
  const { providerData, isLoading, isReady } = useVoiceCatalog({
    provider,
    model,
    capability,
    credentialName: activeCredential,
  });
  const preview: VoicePreviewRequest = {
    provider,
    model,
    language,
    speed: watch(VOICE_OUTPUT_FIELDS.speed) as number | undefined,
    credentialName: activeCredential,
    pronunciations:
      watch("__PronunciationEnabled__Voice") !== false && Array.isArray(pronunciations)
        ? pronunciations
        : [],
  };

  useVoiceOutputReset(provider, language, selectedVoice, providerData, isReady);

  if (isLoading) {
    return (
      <p className="rounded-lg bg-sunken px-3 py-2 text-hint text-muted-foreground">
        Loading voices…
      </p>
    );
  }

  if (!providerData.voices.length) {
    return (
      <p className="rounded-lg bg-sunken px-3 py-2 text-hint text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="grid items-start gap-3 lg:grid-cols-2 2xl:grid-cols-3">
      <SelectField
        size="sm"
        className="h-8"
        name={VOICE_OUTPUT_FIELDS.language}
        selectOptions={providerData.languages}
        label="Language"
      />
      <VoicePickerField
        name={VOICE_OUTPUT_FIELDS.voice}
        voices={providerData.voices}
        preview={showPreview ? preview : undefined}
      />
      <SliderField
        size="sm"
        name={VOICE_OUTPUT_FIELDS.speed}
        label="Speed"
        min={0.7}
        max={1.2}
        step={0.1}
        formatValue={(value) => `${value.toFixed(1)}×`}
      />
    </div>
  );
};
