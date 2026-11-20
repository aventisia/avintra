import { buttonVariants } from "@avplatform/ui/buttons";
import { SelectField } from "@avplatform/ui/form";
import { cn } from "@avplatform/ui/lib";
import { Popover, PopoverContent, PopoverTrigger } from "@avplatform/ui/popover";
import { PlayIcon, SlidersHorizontalIcon, StopIcon } from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useController, useFormContext } from "react-hook-form";

import { SliderField } from "@/components/Slider/SliderField";
import { VOICE_AGENT_NODE_NAME } from "@/features/react-flow/utils/voice-agent-graph.util";
import { SearchableSelectField } from "@/react-toolkit/ui/searchable-select/SearchableSelectField";

import type { VoiceCatalogCapability } from "../../dtos/voice-catalog.dto";
import { useVoiceCatalog } from "../../hooks/useVoiceCatalog.hook";
import { useVoicePreview } from "../../hooks/useVoicePreview.hook";
import { useDynamicConfigPanelStore } from "../../stores/dcp-store";
import { getVoiceClearedNote } from "../../utils/voice-reset-note.util";

const LEGACY_TTS_NODE_NAME = "CreateTTSAIAgent";

export type VoiceConfigFieldProps = {
  /** The base name of the form field */
  name: string;
  /** Form path of the provider this field watches. */
  providerPath?: string;
  /** Form path of the model this field watches. */
  modelPath?: string;
  /** Form path of the BYOK credential name this field watches. */
  credentialPath?: string;
  /** Voice capability of the selected model. */
  capability?: VoiceCatalogCapability;
};

const VoiceConfigField = ({
  name,
  providerPath = "__ModelConfig__TextToSpeech.provider",
  modelPath,
  credentialPath,
  capability = "tts",
}: VoiceConfigFieldProps) => {
  const { control, setValue, watch, formState } = useFormContext();
  const nodeName = useDynamicConfigPanelStore((state) => state.nodeData?.name);
  const isVoiceNode = nodeName === VOICE_AGENT_NODE_NAME || nodeName === LEGACY_TTS_NODE_NAME;

  const fieldNames = useMemo(
    () =>
      ({
        provider: providerPath,
        model: modelPath ?? "__ModelConfig__TextToSpeech.model",
        credential: credentialPath,
        language: `${name}.language`,
        voice: `${name}.voice`,
        speed: `${name}.speed`,
      }) as const,
    [name, providerPath, modelPath, credentialPath],
  );

  const providerValue = watch(fieldNames.provider);
  const modelValue = watch(fieldNames.model);
  const credentialValue = fieldNames.credential ? watch(fieldNames.credential) : undefined;
  const voiceValue = watch(fieldNames.voice);
  const speedValue = watch(fieldNames.speed);
  const pronunciationValue = watch("__Pronunciation__Voice");
  const pronunciationEnabled = watch("__PronunciationEnabled__Voice");
  // IMPORTANT NOTE: the attached credential alone decides BYOK, so a blank or whitespace name is the platform path.
  const activeCredential =
    typeof credentialValue === "string" && credentialValue.trim()
      ? credentialValue.trim()
      : undefined;

  const { field: languageField } = useController({
    name: fieldNames.language,
    control,
  });
  const { field: speedField } = useController({
    name: fieldNames.speed,
    control,
  });

  const languageValue = languageField.value;
  const prevLanguage = useRef(languageValue);
  const prevProvider = useRef(providerValue);
  const prevVoice = useRef(voiceValue);
  const [clearedNote, setClearedNote] = useState<string | null>(null);

  const { providerData, isLoading, isError } = useVoiceCatalog({
    provider: providerValue,
    model: modelValue,
    capability,
    credentialName: activeCredential,
    enabled: isVoiceNode,
  });

  const voices = providerData.voices;
  const sample = voices.find((voice) => voice.value === voiceValue)?.sample ?? null;

  const voicePreview = useVoicePreview({
    provider: providerValue,
    model: modelValue,
    voice: voiceValue,
    sample,
    language: languageValue,
    speed: speedValue,
    credentialName: activeCredential,
    pronunciations:
      pronunciationEnabled === false
        ? []
        : Array.isArray(pronunciationValue)
          ? (pronunciationValue as Array<{ term: string; pronunciation: string }>)
          : [],
  });

  useEffect(() => {
    const providerChanged = prevProvider.current !== providerValue;
    const languageChanged = prevLanguage.current !== languageValue;
    const voiceChanged = prevVoice.current !== voiceValue;

    prevProvider.current = providerValue;
    prevLanguage.current = languageValue;
    prevVoice.current = voiceValue;

    // IMPORTANT NOTE: the form is reset to the saved node values on load and on
    // node switch. Only a dirty form means the user changed provider/language.
    if (!formState.isDirty) return;

    if (providerChanged || languageChanged) {
      setClearedNote(
        getVoiceClearedNote({
          providerChanged,
          languageChanged,
          language: languageValue,
          voice: voiceValue,
        }),
      );
    } else if (voiceChanged) {
      setClearedNote(null);
    }

    if (providerChanged) {
      setValue(fieldNames.language, "", { shouldDirty: true });
      setValue(fieldNames.voice, "", { shouldDirty: true });
      prevLanguage.current = "";
      prevVoice.current = "";
    } else if (languageChanged) {
      setValue(fieldNames.voice, "", { shouldDirty: true });
      prevVoice.current = "";
    }
  }, [providerValue, languageValue, voiceValue, formState.isDirty, setValue, fieldNames]);

  if (!isVoiceNode) {
    return null;
  }

  if (isLoading) {
    return <p className="text-hint text-muted-foreground">Loading voices…</p>;
  }

  if (isError && providerData.languages.length === 0 && providerData.voices.length === 0) {
    return (
      <p role="alert" className="text-hint text-bad">
        Voices could not be loaded. Try again later.
      </p>
    );
  }

  if (providerData.languages.length === 0 && providerData.voices.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-3.5">
      <SelectField
        size="sm"
        name={fieldNames.language}
        selectOptions={providerData.languages}
        label="Language"
        disabled={providerData.languages.length === 0}
      />

      <div className="flex items-end gap-1">
        <div className="flex-grow">
          <SearchableSelectField
            size="sm"
            name={fieldNames.voice}
            selectOptions={voices}
            label="Voice"
            primaryText="Voices"
            disabled={voices.length === 0}
          />
        </div>

        <Popover>
          <PopoverTrigger className={cn(buttonVariants({ size: "icon8", variant: "outline" }))}>
            <SlidersHorizontalIcon className="h-3 w-3" />
          </PopoverTrigger>

          <PopoverContent className="mr-6 w-[25rem] space-y-3.5 p-2">
            <Controller
              {...speedField}
              render={({ field }) => (
                <SliderField label="Speed" name={field.name} min={0.7} max={1.2} step={0.1} />
              )}
            />
          </PopoverContent>
        </Popover>

        <button
          type="button"
          aria-label={
            voicePreview.isPreviewing
              ? "Stop voice preview"
              : voicePreview.canPreview
                ? "Preview voice"
                : `Preview voice — ${
                    voicePreview.isSupported
                      ? "pick a model first"
                      : "not supported for this provider"
                  }`
          }
          disabled={!voicePreview.canPreview && !voicePreview.isPreviewing}
          onClick={() =>
            voicePreview.isPreviewing ? voicePreview.stopPreview() : voicePreview.playPreview()
          }
          className={cn(buttonVariants({ size: "icon8", variant: "outline" }))}
        >
          {voicePreview.isPreviewing ? (
            <StopIcon className="h-3 w-3" weight="fill" />
          ) : (
            <PlayIcon className="h-3 w-3" />
          )}
        </button>
      </div>

      {!voicePreview.isSupported ? (
        <p className="text-hint text-muted-foreground">Preview not supported for this provider.</p>
      ) : null}

      {voicePreview.error ? (
        <p role="alert" className="text-hint text-bad">
          {voicePreview.error}
        </p>
      ) : null}

      {clearedNote ? <p className="text-hint text-muted-foreground">{clearedNote}</p> : null}
    </div>
  );
};

VoiceConfigField.displayName = "VoiceConfigField";

export { VoiceConfigField };
