import { ModelCapabilityEnum } from "@avplatform/ui/enums";
import { SelectField } from "@avplatform/ui/form";
import { useFormContext } from "react-hook-form";

import { SliderField } from "@/components/Slider/SliderField";
import {
  type VoiceCatalogCapability,
  useFetchTenantEnabledModels,
  useVoiceCatalog,
} from "@/features/dynamic-config-panel";

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
  const { providerData, isLoading, isReady, isError } = useVoiceCatalog({
    provider,
    model,
    capability,
    credentialName: activeCredential,
  });
  const {
    data: enabledModels,
    isLoading: isEnabledModelsLoading,
    isError: isEnabledModelsError,
  } = useFetchTenantEnabledModels(
    capability === "realtime" ? ModelCapabilityEnum.Realtime : ModelCapabilityEnum.Tts,
    Boolean(activeCredential),
  );
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

  const clearedNote = useVoiceOutputReset(provider, language, selectedVoice, providerData, isReady);

  const hasNoEnabledModels =
    Boolean(activeCredential) &&
    !isEnabledModelsLoading &&
    !isEnabledModelsError &&
    (enabledModels?.data?.length ?? 0) === 0;

  const modelProvidersHref = `${(import.meta.env.VITE_WORKSPACE_PATH ?? "").replace(/\/$/, "")}/tenant/model-providers`;

  if (isError && providerData.voices.length === 0 && providerData.languages.length === 0) {
    return (
      <p role="alert" className="rounded-lg bg-sunken px-3 py-2 text-hint text-bad">
        Voices could not be loaded. Try again later.
      </p>
    );
  }

  if (isLoading) {
    return (
      <p className="rounded-lg bg-sunken px-3 py-2 text-hint text-muted-foreground">
        Loading voices…
      </p>
    );
  }

  if (hasNoEnabledModels) {
    return (
      <p className="rounded-lg bg-sunken px-3 py-2 text-hint text-muted-foreground">
        No voices are enabled for this tenant. Enable one under{" "}
        <a
          href={modelProvidersHref}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2"
        >
          Tenant Admin → Model Providers
        </a>
        .
      </p>
    );
  }

  if (!providerData.voices.length) {
    return (
      <div className="space-y-2">
        <p className="rounded-lg bg-sunken px-3 py-2 text-hint text-muted-foreground">
          {emptyMessage}
        </p>
        {clearedNote ? <p className="text-hint text-muted-foreground">{clearedNote}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-2">
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
      {clearedNote ? <p className="text-hint text-muted-foreground">{clearedNote}</p> : null}
    </div>
  );
};
