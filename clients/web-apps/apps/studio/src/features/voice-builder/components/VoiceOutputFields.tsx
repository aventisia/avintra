import { SelectField } from "@avplatform/ui/form";
import { cn } from "@avplatform/ui/lib";
import { Check, Play, Square } from "lucide-react";
import { type ReactNode } from "react";
import { useFormContext } from "react-hook-form";

import { SliderField } from "@/components/Slider/SliderField";
import {
  type VoiceCatalogCapability,
  type VoiceOption,
  useVoiceCatalog,
  useVoicePreview,
} from "@/features/dynamic-config-panel";

import { VOICE_OUTPUT_FIELDS } from "../constants/voice-builder.constant";
import { useVoiceOutputReset } from "../hooks/useVoiceOutputReset.hook";

type PreviewRequest = Omit<Parameters<typeof useVoicePreview>[0], "voice" | "sample">;

const splitVoiceLabel = (label: string) => {
  const match = /^(.*?)\s*\((.*)\)$/.exec(label);
  return match ? { name: match[1], traits: match[2] } : { name: label, traits: "" };
};

const VoiceCardRow = ({
  voice,
  isSelected,
  onSelect,
  error,
  action,
}: {
  voice: VoiceOption;
  isSelected: boolean;
  onSelect: () => void;
  error?: string;
  action?: ReactNode;
}) => {
  const { name, traits } = splitVoiceLabel(voice.label);

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-line hover:bg-hover",
        action && "pr-2",
        isSelected && "border-primary bg-selected hover:bg-selected",
      )}
    >
      <button
        type="button"
        role="radio"
        aria-checked={isSelected}
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-3 py-2 text-left focus-visible:shadow-focus focus-visible:outline-none"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-body-sm font-semibold text-ink">{name}</span>
          {traits && (
            <span className="block truncate text-hint text-muted-foreground">{traits}</span>
          )}
          {error && <span className="block text-hint text-bad">{error}</span>}
        </span>
        {isSelected && <Check aria-hidden="true" className="size-4 shrink-0 text-primary-text" />}
      </button>
      {action}
    </div>
  );
};

const PreviewVoiceCard = ({
  voice,
  isSelected,
  onSelect,
  preview,
}: {
  voice: VoiceOption;
  isSelected: boolean;
  onSelect: () => void;
  preview: PreviewRequest;
}) => {
  const { name } = splitVoiceLabel(voice.label);
  const player = useVoicePreview({ ...preview, voice: voice.value, sample: voice.sample });

  return (
    <VoiceCardRow
      voice={voice}
      isSelected={isSelected}
      onSelect={onSelect}
      error={player.error ?? undefined}
      action={
        <button
          type="button"
          aria-label={player.isPreviewing ? `Stop ${name}` : `Preview ${name}`}
          title={player.isSupported ? undefined : "Preview is not supported for this provider"}
          disabled={!player.canPreview && !player.isPreviewing}
          onClick={() => (player.isPreviewing ? player.stopPreview() : void player.playPreview())}
          className="grid size-7 shrink-0 place-items-center rounded-full border border-line text-ink-2 hover:bg-fill focus-visible:shadow-focus focus-visible:outline-none disabled:opacity-40"
        >
          {player.isPreviewing ? (
            <Square aria-hidden="true" className="size-3" />
          ) : (
            <Play aria-hidden="true" className="size-3" />
          )}
        </button>
      }
    />
  );
};

const VoiceCard = ({
  voice,
  isSelected,
  onSelect,
  preview,
  showPreview,
}: {
  voice: VoiceOption;
  isSelected: boolean;
  onSelect: () => void;
  preview: PreviewRequest;
  showPreview: boolean;
}) =>
  showPreview ? (
    <PreviewVoiceCard voice={voice} isSelected={isSelected} onSelect={onSelect} preview={preview} />
  ) : (
    <VoiceCardRow voice={voice} isSelected={isSelected} onSelect={onSelect} />
  );

type VoiceOutputFieldsProps = {
  provider?: string;
  model?: string;
  capability: VoiceCatalogCapability;
  credentialName?: string;
  isByokEnabled?: boolean;
  showPreview?: boolean;
  emptyMessage: string;
};

export const VoiceOutputFields = ({
  provider,
  model,
  capability,
  credentialName,
  isByokEnabled,
  showPreview = true,
  emptyMessage,
}: VoiceOutputFieldsProps) => {
  const { watch, setValue } = useFormContext();
  const language = watch(VOICE_OUTPUT_FIELDS.language) as string | undefined;
  const selectedVoice = watch(VOICE_OUTPUT_FIELDS.voice) as string | undefined;
  const pronunciations = watch("__Pronunciation__Voice") as unknown;
  const { providerData, isLoading, isReady } = useVoiceCatalog({
    provider,
    model,
    capability,
    credentialName: isByokEnabled ? credentialName : undefined,
  });
  const voices = providerData.voices;

  const preview: PreviewRequest = {
    provider,
    model,
    language,
    speed: watch(VOICE_OUTPUT_FIELDS.speed) as number | undefined,
    credentialName,
    isByokEnabled,
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
    <>
      <SelectField
        size="sm"
        name={VOICE_OUTPUT_FIELDS.language}
        selectOptions={providerData.languages}
        label="Language"
      />
      <div className="space-y-1.5">
        <span className="ml-1 block text-hint font-semibold text-ink">Voice</span>
        <div role="radiogroup" aria-label="Voice" className="grid gap-2 sm:grid-cols-2">
          {voices.map((voice) => (
            <VoiceCard
              key={voice.value}
              voice={voice}
              isSelected={selectedVoice === voice.value}
              onSelect={() =>
                setValue(VOICE_OUTPUT_FIELDS.voice, voice.value, { shouldDirty: true })
              }
              preview={preview}
              showPreview={showPreview}
            />
          ))}
        </div>
      </div>
      <SliderField name={VOICE_OUTPUT_FIELDS.speed} label="Speed" min={0.7} max={1.2} step={0.1} />
    </>
  );
};
