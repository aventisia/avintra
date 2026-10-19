import { useCallback, useEffect, useRef, useState } from "react";

import { synthesizeVoicePreview } from "../apis/voice-preview-apis";
import {
  VOICE_PREVIEW_SAMPLE_TEXT,
  buildAudioDataUrl,
  isTtsPreviewSupported,
} from "../utils/voice-preview.util";

type VoicePreviewRequest = {
  provider?: string;
  model?: string;
  voice?: string;
  language?: string;
  speed?: number;
  credentialName?: string;
  isByokEnabled?: boolean;
  pronunciations?: Array<{ term: string; pronunciation: string }>;
};

/**
 * Plays a voice sample through the LiteLLM TTS route and reports whether the
 * selected provider supports preview at all.
 */
export const useVoicePreview = ({
  provider,
  model,
  voice,
  language,
  speed,
  credentialName,
  isByokEnabled,
  pronunciations,
}: VoicePreviewRequest) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSupported = isTtsPreviewSupported(provider);
  const canPreview = isSupported && !!model && !isPreviewing;

  useEffect(
    () => () => {
      audioRef.current?.pause();
      audioRef.current = null;
    },
    [],
  );

  const stopPreview = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    setIsPreviewing(false);
  }, []);

  const playPreview = useCallback(async () => {
    if (!isSupported || !provider || !model) return;

    setError(null);
    setIsPreviewing(true);

    try {
      const response = await synthesizeVoicePreview({
        provider,
        model,
        input: VOICE_PREVIEW_SAMPLE_TEXT,
        voice_id: voice || null,
        language: language || null,
        speed: speed ?? 1,
        pronunciations: pronunciations && pronunciations.length > 0 ? pronunciations : null,
        stream: false,
        credential_name: credentialName || null,
        is_byok_enabled: isByokEnabled ?? false,
        ref_type: "",
        ref_id: "",
        ref_name: "",
        action: "voice-preview",
        agent_name: null,
      });

      if (!response?.output) {
        setError(response?.error || "Voice preview could not be generated.");
        setIsPreviewing(false);
        return;
      }

      const audio = new Audio(buildAudioDataUrl(response.output));
      audioRef.current = audio;
      audio.onended = () => setIsPreviewing(false);
      audio.onerror = () => {
        setError("Voice preview could not be played.");
        setIsPreviewing(false);
      };
      await audio.play();
    } catch {
      setError("Voice preview request failed.");
      setIsPreviewing(false);
    }
  }, [
    isSupported,
    provider,
    model,
    voice,
    language,
    speed,
    credentialName,
    isByokEnabled,
    pronunciations,
  ]);

  return { isSupported, canPreview, isPreviewing, error, playPreview, stopPreview };
};
