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
  sample?: string | null;
  language?: string;
  speed?: number;
  credentialName?: string;
  isByokEnabled?: boolean;
  pronunciations?: Array<{ term: string; pronunciation: string }>;
};

// IMPORTANT NOTE: each voice row renders its own player, so the shared registry
// stops the playing preview before another row starts one.
const activeStoppers = new Set<() => void>();

/** Plays a voice sample through its provider preview URL or the LiteLLM TTS route. */
export const useVoicePreview = ({
  provider,
  model,
  voice,
  sample,
  language,
  speed,
  credentialName,
  isByokEnabled,
  pronunciations,
}: VoicePreviewRequest) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasSample = Boolean(sample);
  const isSupported = hasSample || isTtsPreviewSupported(provider);
  const canPreview = isSupported && (hasSample || !!model) && !isPreviewing;

  const stopPreview = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    setIsPreviewing(false);
  }, []);

  useEffect(() => {
    activeStoppers.add(stopPreview);
    return () => {
      activeStoppers.delete(stopPreview);
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [stopPreview]);

  const playPreview = useCallback(async () => {
    if (!isSupported) return;
    if (!hasSample && (!provider || !model)) return;

    const ttsProvider = provider as string;
    const ttsModel = model as string;

    activeStoppers.forEach((stop) => {
      if (stop !== stopPreview) stop();
    });
    setError(null);
    setIsPreviewing(true);

    const audio = new Audio();
    audioRef.current = audio;
    audio.onended = () => setIsPreviewing(false);
    audio.onerror = () => {
      setError("Voice preview could not be played.");
      setIsPreviewing(false);
    };

    try {
      if (hasSample) {
        audio.src = sample as string;
      } else {
        const response = await synthesizeVoicePreview({
          provider: ttsProvider,
          model: ttsModel,
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

        if (audioRef.current !== audio) return;

        if (!response?.output) {
          setError(response?.error || "Voice preview could not be generated.");
          setIsPreviewing(false);
          return;
        }

        audio.src = buildAudioDataUrl(response.output);
      }

      await audio.play();
    } catch {
      if (audioRef.current !== audio) return;
      setError(hasSample ? "Voice preview could not be played." : "Voice preview request failed.");
      setIsPreviewing(false);
    }
  }, [
    isSupported,
    hasSample,
    sample,
    provider,
    model,
    voice,
    language,
    speed,
    credentialName,
    isByokEnabled,
    pronunciations,
    stopPreview,
  ]);

  return { isSupported, canPreview, isPreviewing, error, playPreview, stopPreview };
};
