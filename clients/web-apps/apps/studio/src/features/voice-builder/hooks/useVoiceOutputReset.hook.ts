import { useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";

import type { VoiceProviderData } from "@/features/dynamic-config-panel";

import { VOICE_OUTPUT_FIELDS } from "../constants/voice-builder.constant";

type PreviousSelection = { provider?: string; language?: string };

/** Clears a saved voice when the provider or language it belongs to changes. */
export const useVoiceOutputReset = (
  provider: string | undefined,
  language: string | undefined,
  selectedVoice: string | undefined,
  providerData: VoiceProviderData,
) => {
  const { setValue } = useFormContext();
  const previous = useRef<PreviousSelection>({});

  // IMPORTANT NOTE: the voice setting is shared by both engine modes, so a value
  // saved under a different provider must be cleared when the panel mounts.
  useEffect(() => {
    const isFirstRun = previous.current.provider === undefined;
    const providerChanged = previous.current.provider !== provider;
    const languageChanged = previous.current.language !== language;
    previous.current = { provider, language };

    if (!provider) return;

    if (isFirstRun) {
      const languageIsKnown =
        !language || providerData.languages.some((option) => option.value === language);
      if (!languageIsKnown) {
        setValue(VOICE_OUTPUT_FIELDS.language, "", { shouldDirty: true });
        setValue(VOICE_OUTPUT_FIELDS.voice, "", { shouldDirty: true });
      } else if (
        selectedVoice &&
        !providerData.voices.some((voice) => voice.value === selectedVoice)
      ) {
        setValue(VOICE_OUTPUT_FIELDS.voice, "", { shouldDirty: true });
      }
      return;
    }

    if (providerChanged) {
      setValue(VOICE_OUTPUT_FIELDS.language, "", { shouldDirty: true });
      setValue(VOICE_OUTPUT_FIELDS.voice, "", { shouldDirty: true });
    } else if (languageChanged) {
      setValue(VOICE_OUTPUT_FIELDS.voice, "", { shouldDirty: true });
    }
  }, [provider, language, providerData, selectedVoice, setValue]);
};
