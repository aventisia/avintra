/**
 * Browser sound-effect playback for VoiceAgent sessions.
 *
 * Each sound uses its own `HTMLAudioElement`. Playback failures (autoplay
 * policy, unreachable URL) are ignored so voice conversations are never
 * interrupted by a sound effect.
 */
export type VoiceSfx = {
  /** Plays the tool-call cue once; no-op when no URL is configured. */
  playToolCallCue: (url?: string | null) => void;
  /** Starts looping the ambience sound; no-op when no URL is configured. */
  startAmbience: (url?: string | null) => void;
  /** Stops and clears the looping ambience sound. */
  stopAmbience: () => void;
};

export function createVoiceSfx(): VoiceSfx {
  let cue: HTMLAudioElement | null = null;
  let ambience: HTMLAudioElement | null = null;

  const playToolCallCue = (url?: string | null) => {
    if (!url) return;
    cue?.pause();
    cue = new Audio(url);
    void cue.play().catch(() => undefined);
  };

  const startAmbience = (url?: string | null) => {
    if (!url) return;
    ambience?.pause();
    ambience = new Audio(url);
    ambience.loop = true;
    void ambience.play().catch(() => undefined);
  };

  const stopAmbience = () => {
    ambience?.pause();
    ambience = null;
  };

  return { playToolCallCue, startAmbience, stopAmbience };
}
