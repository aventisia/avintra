import { SelectField } from "@avplatform/ui/form";
import { cn } from "@avplatform/ui/lib";
import { Check, Play, Square } from "lucide-react";
import { useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";

import { SliderField } from "@/components/Slider/SliderField";
import { GroupedFieldsWrapper } from "@/features/dynamic-config-panel/components/fields-for-form/GroupedFieldsWrapper";
import { ModelConfigField } from "@/features/dynamic-config-panel/components/fields-for-form/ModelConfigField";
import {
  type VoiceOption,
  voiceProviderData,
} from "@/features/dynamic-config-panel/constants/voice-providers";
import { useVoicePreview } from "@/features/dynamic-config-panel/hooks/useVoicePreview.hook";

import { VOICE_FIELDS } from "../constants/voice-builder.constant";

const LANGUAGE = `${VOICE_FIELDS.voiceConfig}.language`;
const VOICE = `${VOICE_FIELDS.voiceConfig}.voice`;
const SPEED = `${VOICE_FIELDS.voiceConfig}.speed`;

type PreviewRequest = Omit<Parameters<typeof useVoicePreview>[0], "voice">;

const splitVoiceLabel = (label: string) => {
  const match = /^(.*?)\s*\((.*)\)$/.exec(label);
  return match ? { name: match[1], traits: match[2] } : { name: label, traits: "" };
};

const VoiceCard = ({
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
  const { name, traits } = splitVoiceLabel(voice.label);
  const player = useVoicePreview({ ...preview, voice: voice.value });

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-line pr-2 hover:bg-hover",
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
          {player.error && <span className="block text-hint text-bad">{player.error}</span>}
        </span>
        {isSelected && <Check aria-hidden="true" className="size-4 shrink-0 text-primary-text" />}
      </button>
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
    </div>
  );
};

export const VoiceTtsSection = () => {
  const { watch, setValue } = useFormContext();
  const provider = watch(`${VOICE_FIELDS.textToSpeech}.provider`) as string | undefined;
  const language = watch(LANGUAGE) as string | undefined;
  const selectedVoice = watch(VOICE) as string | undefined;
  const pronunciations = watch("__Pronunciation__Voice") as unknown;
  const providerData = (provider && voiceProviderData[provider]) || { languages: [], voices: [] };
  const voices = providerData.voices.filter(
    (voice) => !language || !voice.languageId || voice.languageId === language,
  );

  const preview: PreviewRequest = {
    provider,
    model: watch(`${VOICE_FIELDS.textToSpeech}.model`) as string | undefined,
    language,
    speed: watch(SPEED) as number | undefined,
    credentialName: watch(`${VOICE_FIELDS.textToSpeech}.credential_name`) as string | undefined,
    isByokEnabled: watch(`${VOICE_FIELDS.textToSpeech}.is_byok_enabled`) as boolean | undefined,
    pronunciations:
      watch("__PronunciationEnabled__Voice") !== false && Array.isArray(pronunciations)
        ? pronunciations
        : [],
  };

  // A voice belongs to one provider and language, so changing either clears it.
  const previous = useRef({ provider, language });
  useEffect(() => {
    if (previous.current.provider !== provider) {
      setValue(LANGUAGE, "", { shouldDirty: true });
      setValue(VOICE, "", { shouldDirty: true });
    } else if (previous.current.language !== language) {
      setValue(VOICE, "", { shouldDirty: true });
    }
    previous.current = { provider, language };
  }, [provider, language, setValue]);

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

      {providerData.voices.length ? (
        <>
          <SelectField
            size="sm"
            name={LANGUAGE}
            selectOptions={providerData.languages}
            label="Language"
          />
          <div role="radiogroup" aria-label="Voice" className="grid gap-2 sm:grid-cols-2">
            {voices.map((voice) => (
              <VoiceCard
                key={voice.value}
                voice={voice}
                isSelected={selectedVoice === voice.value}
                onSelect={() => setValue(VOICE, voice.value, { shouldDirty: true })}
                preview={preview}
              />
            ))}
          </div>
          <SliderField name={SPEED} label="Speed" min={0.7} max={1.2} step={0.1} />
        </>
      ) : (
        <p className="rounded-lg bg-sunken px-3 py-2 text-hint text-muted-foreground">
          Pick a text-to-speech provider above to see its voices.
        </p>
      )}
    </GroupedFieldsWrapper>
  );
};
