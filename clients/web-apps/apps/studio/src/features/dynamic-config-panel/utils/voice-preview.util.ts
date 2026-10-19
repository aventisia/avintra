/** Providers whose voices can be previewed through the LiteLLM TTS route. */
const TTS_PREVIEW_PROVIDERS = [
  "elevenlabs",
  "openai",
  "googlegemini",
  "azure",
  "vertex_ai",
] as const;

/** Sample text spoken when previewing a voice. */
export const VOICE_PREVIEW_SAMPLE_TEXT = "Hi, this is how this voice sounds.";

/** Reports whether the selected provider supports voice preview. */
export const isTtsPreviewSupported = (providerValue?: string): boolean =>
  !!providerValue && (TTS_PREVIEW_PROVIDERS as readonly string[]).includes(providerValue);

/**
 * Builds a playable data URL from the base64 audio returned by the TTS route,
 * sniffing WAV (RIFF) payloads so the browser picks the right decoder.
 */
export const buildAudioDataUrl = (base64Audio: string): string => {
  const mimeType = base64Audio.startsWith("UklGR") ? "audio/wav" : "audio/mpeg";
  return `data:${mimeType};base64,${base64Audio}`;
};
