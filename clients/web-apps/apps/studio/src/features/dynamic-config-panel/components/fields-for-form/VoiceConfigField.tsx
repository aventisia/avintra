import { buttonVariants } from "@avplatform/ui/buttons";
import { SelectField } from "@avplatform/ui/form";
import { cn } from "@avplatform/ui/lib";
import { Popover, PopoverContent, PopoverTrigger } from "@avplatform/ui/popover";
import { Settings2Icon } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { Controller, useController, useFormContext } from "react-hook-form";

import { SliderField } from "@/components/Slider/SliderField";
// Import your static voice mappings here
import { SearchableSelectField } from "@/react-toolkit/ui/searchable-select/SearchableSelectField";

import { voiceProviderData } from "../../constants/voice-providers";

export interface VoiceConfigFieldProps {
  /** The base name of the form field */
  name: string;
}

const VoiceConfigField = ({ name }: VoiceConfigFieldProps) => {
  const { control, setValue, watch } = useFormContext();

  // 1. Memoize Field Names
  const fieldNames = useMemo(
    () =>
      ({
        provider: `__ModelConfig__TextToSpeech.provider`, // Watch the provider selected in ModelConfigField
        language: `${name}.language`,
        voice: `${name}.voice`,
        speed: `${name}.speed`,
        // pitch: `${name}.pitch`,
      }) as const,
    [name],
  );

  // Watch the provider value dynamically
  const providerValue = watch(fieldNames.provider);

  // 2. Controllers for Voice fields
  const { field: languageField } = useController({
    name: fieldNames.language,
    control,
  });
  const { field: speedField } = useController({
    name: fieldNames.speed,
    control,
  });
  // const { field: pitchField } = useController({
  //   name: fieldNames.pitch,
  //   control,
  // });

  const languageValue = languageField.value;
  const prevLanguage = useRef(languageValue);
  const prevProvider = useRef(providerValue);

  // 3. Get Data based on the selected Provider
  const providerVoiceData = useMemo(() => {
    if (!providerValue || !voiceProviderData[providerValue]) {
      return { languages: [], voices: [] };
    }
    return voiceProviderData[providerValue];
  }, [providerValue]);

  // 4. Filter voices dynamically based on selected language
  const filteredVoices = useMemo(() => {
    const allProviderVoices = providerVoiceData.voices;
    if (!languageValue) return allProviderVoices;

    return allProviderVoices.filter((v) => v.languageId === languageValue || !v.languageId);
  }, [providerVoiceData, languageValue]);

  // 5. Handle Field Resets (Reset state when provider or language changes)
  useEffect(() => {
    // If provider changes, reset both language and voice
    if (prevProvider.current !== providerValue) {
      prevProvider.current = providerValue;
      setValue(fieldNames.language, "", { shouldDirty: true });
      setValue(fieldNames.voice, "", { shouldDirty: true });
      return;
    }

    // If only language changes, reset the voice
    if (prevLanguage.current !== languageValue) {
      prevLanguage.current = languageValue;
      setValue(fieldNames.voice, "", { shouldDirty: true });
    }
  }, [providerValue, languageValue, setValue, fieldNames]);

  // If no provider data is found (e.g. Inferencing node), render nothing or a disabled state.
  // Returning null completely hides this component if the provider doesn't support voices.
  if (providerVoiceData.languages.length === 0 && providerVoiceData.voices.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-3.5">
      <SelectField
        size="sm"
        name={fieldNames.language}
        selectOptions={providerVoiceData.languages}
        label="Language"
        disabled={providerVoiceData.languages.length === 0}
      />

      <div className="flex items-end gap-1">
        <div className="flex-grow">
          <SearchableSelectField
            size="sm"
            name={fieldNames.voice}
            selectOptions={filteredVoices}
            label="Voice"
            primaryText="Voices"
            disabled={filteredVoices.length === 0}
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

            {/* <Controller
              {...pitchField}
              render={({ field }) => (
                <SliderField
                  label="Pitch"
                  name={field.name}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                />
              )}
            /> */}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

VoiceConfigField.displayName = "VoiceConfigField";

export { VoiceConfigField };
