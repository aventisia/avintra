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
import type { VoiceEngineMode } from "../types/voice-builder.type";
import { VoicePickerField, type VoicePreviewRequest } from "./VoicePickerField";

type VoiceOutputFieldsProps = {
  mode: VoiceEngineMode;
  provider?: string;
  model?: string;
  capability: VoiceCatalogCapability;
  credentialName?: string;
  showPreview?: boolean;
  emptyMessage: string;
};

export const VoiceOutputFields = ({
  mode,
  provider,
  model,
  capability,
  credentialName,
  showPreview = true,
  emptyMessage,
}: VoiceOutputFieldsProps) => {
  const { watch } = useFormContext();
  const fields = VOICE_OUTPUT_FIELDS[mode];
  const language = watch(fields.language) as string | undefined;
  const selectedVoice = watch(fields.voice) as string | undefined;
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
    speed: watch(fields.speed) as number | undefined,
    credentialName: activeCredential,
    pronunciations:
      watch("__PronunciationEnabled__Voice") !== false && Array.isArray(pronunciations)
        ? pronunciations
        : [],
  };

  // IMPORTANT NOTE: the provider-level fallback list is stale for newer voices, so a saved voice
  // is validated only against the selected model's loaded catalog. The catalog is credential-scoped
  // when a credential is attached (a BYOK account lists its own voices) and platform-scoped otherwise.
  const isCatalogReady = isReady && !isError && Boolean(model);
  const clearedNote = useVoiceOutputReset(
    mode,
    provider,
    language,
    selectedVoice,
    providerData,
    isCatalogReady,
  );

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
      {provider && model && !activeCredential ? (
        <p className="rounded-lg bg-sunken px-3 py-2 text-hint text-muted-foreground">
          Pick the credential this model uses to load its account voices.
        </p>
      ) : null}
      <div className="grid items-start gap-3 lg:grid-cols-2 2xl:grid-cols-3">
        <SelectField
          size="sm"
          className="h-8"
          name={fields.language}
          selectOptions={providerData.languages}
          label="Language"
        />
        <VoicePickerField
          name={fields.voice}
          voices={providerData.voices}
          preview={showPreview ? preview : undefined}
        />
        <SliderField
          size="sm"
          name={fields.speed}
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
