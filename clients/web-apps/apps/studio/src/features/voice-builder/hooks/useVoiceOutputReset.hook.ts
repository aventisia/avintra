import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";

import { type VoiceProviderData, getVoiceClearedNote } from "@/features/dynamic-config-panel";

import { VOICE_OUTPUT_FIELDS } from "../constants/voice-builder.constant";
import type { VoiceEngineMode } from "../types/voice-builder.type";

type PreviousSelection = { provider?: string; language?: string; voice?: string };

/** Clears a saved voice when the provider or language it belongs to changes, and names what it cleared. */
export const useVoiceOutputReset = (
  mode: VoiceEngineMode,
  provider: string | undefined,
  language: string | undefined,
  selectedVoice: string | undefined,
  providerData: VoiceProviderData,
  isCatalogReady: boolean,
) => {
  const { setValue } = useFormContext();
  const fields = VOICE_OUTPUT_FIELDS[mode];
  const previous = useRef<PreviousSelection>({});
  const [clearedNote, setClearedNote] = useState<string | null>(null);

  useEffect(() => {
    if (!provider || !isCatalogReady) return;

    const isFirstRun = previous.current.provider === undefined;
    const providerChanged = previous.current.provider !== provider;
    const languageChanged = previous.current.language !== language;
    const voiceChanged = previous.current.voice !== selectedVoice;
    previous.current = { provider, language, voice: selectedVoice };

    if (isFirstRun) {
      const languageIsKnown =
        !language || providerData.languages.some((option) => option.value === language);
      if (!languageIsKnown) {
        setValue(fields.language, "", { shouldDirty: false });
        setValue(fields.voice, "", { shouldDirty: false });
      } else if (
        selectedVoice &&
        !providerData.voices.some((voice) => voice.value === selectedVoice)
      ) {
        setValue(fields.voice, "", { shouldDirty: false });
      }
      return;
    }

    if (providerChanged || languageChanged) {
      setClearedNote(
        getVoiceClearedNote({ providerChanged, languageChanged, language, voice: selectedVoice }),
      );
    } else if (voiceChanged) {
      setClearedNote(null);
    }

    if (providerChanged) {
      setValue(fields.language, "", { shouldDirty: true });
      setValue(fields.voice, "", { shouldDirty: true });
      previous.current.language = "";
      previous.current.voice = "";
    } else if (languageChanged) {
      setValue(fields.voice, "", { shouldDirty: true });
      previous.current.voice = "";
    }
  }, [provider, language, providerData, isCatalogReady, selectedVoice, setValue, fields]);

  return clearedNote;
};
