import { buttonVariants } from "@avplatform/ui/buttons";
import { SelectField } from "@avplatform/ui/form";
import { cn } from "@avplatform/ui/lib";
import { Popover, PopoverContent, PopoverTrigger } from "@avplatform/ui/popover";
import { PlayIcon, Settings2Icon, SquareIcon } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { Controller, useController, useFormContext } from "react-hook-form";

import { SliderField } from "@/components/Slider/SliderField";
import { VOICE_AGENT_NODE_NAME } from "@/features/react-flow/utils/voice-agent-graph.util";
import { SearchableSelectField } from "@/react-toolkit/ui/searchable-select/SearchableSelectField";

import type { VoiceCatalogCapability } from "../../dtos/voice-catalog.dto";
import { useVoiceCatalog } from "../../hooks/useVoiceCatalog.hook";
import { useVoicePreview } from "../../hooks/useVoicePreview.hook";
import { useDynamicConfigPanelStore } from "../../stores/dcp-store";

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
  /** Form path of the BYOK toggle this field watches. */
  isByokPath?: string;
  /** Voice capability of the selected model. */
  capability?: VoiceCatalogCapability;
};

const VoiceConfigField = ({
  name,
  providerPath = "__ModelConfig__TextToSpeech.provider",
  modelPath,
  credentialPath,
  isByokPath,
  capability = "tts",
}: VoiceConfigFieldProps) => {
  const { control, setValue, watch } = useFormContext();
  const nodeName = useDynamicConfigPanelStore((state) => state.nodeData?.name);
  const isVoiceNode = nodeName === VOICE_AGENT_NODE_NAME || nodeName === LEGACY_TTS_NODE_NAME;

  const fieldNames = useMemo(
    () =>
      ({
        provider: providerPath,
        model: modelPath ?? "__ModelConfig__TextToSpeech.model",
        credential: credentialPath,
        isByok: isByokPath,
        language: `${name}.language`,
        voice: `${name}.voice`,
        speed: `${name}.speed`,
      }) as const,
    [name, providerPath, modelPath, credentialPath, isByokPath],
  );

  const providerValue = watch(fieldNames.provider);
  const modelValue = watch(fieldNames.model);
  const credentialValue = fieldNames.credential ? watch(fieldNames.credential) : undefined;
  const isByokValue = fieldNames.isByok ? watch(fieldNames.isByok) : undefined;
  const voiceValue = watch(fieldNames.voice);
  const speedValue = watch(fieldNames.speed);
  const pronunciationValue = watch("__Pronunciation__Voice");
  const pronunciationEnabled = watch("__PronunciationEnabled__Voice");

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

  const { providerData, isLoading } = useVoiceCatalog({
    provider: providerValue,
    model: modelValue,
    capability,
    credentialName: isByokValue ? credentialValue : undefined,
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
    credentialName: credentialValue,
    isByokEnabled: isByokValue,
    pronunciations:
      pronunciationEnabled === false
        ? []
        : Array.isArray(pronunciationValue)
          ? (pronunciationValue as Array<{ term: string; pronunciation: string }>)
          : [],
  });

  useEffect(() => {
    if (prevProvider.current !== providerValue) {
      prevProvider.current = providerValue;
      setValue(fieldNames.language, "", { shouldDirty: true });
      setValue(fieldNames.voice, "", { shouldDirty: true });
      return;
    }

    if (prevLanguage.current !== languageValue) {
      prevLanguage.current = languageValue;
      setValue(fieldNames.voice, "", { shouldDirty: true });
    }
  }, [providerValue, languageValue, setValue, fieldNames]);

  if (!isVoiceNode) {
    return null;
  }

  if (isLoading) {
    return <p className="text-xs text-muted-foreground">Loading voices…</p>;
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
            <Settings2Icon className="h-3 w-3" />
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
          aria-label="Preview voice"
          disabled={!voicePreview.canPreview && !voicePreview.isPreviewing}
          onClick={() =>
            voicePreview.isPreviewing ? voicePreview.stopPreview() : voicePreview.playPreview()
          }
          className={cn(buttonVariants({ size: "icon8", variant: "outline" }))}
        >
          {voicePreview.isPreviewing ? (
            <SquareIcon className="h-3 w-3" />
          ) : (
            <PlayIcon className="h-3 w-3" />
          )}
        </button>
      </div>

      {!voicePreview.isSupported ? (
        <p className="text-xs text-muted-foreground">Preview not supported for this provider.</p>
      ) : null}

      {voicePreview.error ? <p className="text-xs text-destructive">{voicePreview.error}</p> : null}
    </div>
  );
};

VoiceConfigField.displayName = "VoiceConfigField";

export { VoiceConfigField };
