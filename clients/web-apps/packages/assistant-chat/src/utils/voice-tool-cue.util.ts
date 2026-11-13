const CUE_SECONDS = 0.22;

/** Plays the built-in tool-call cue: a short soft tone that covers silence while a tool runs. */
export const playVoiceToolCue = () => {
  if (typeof window === "undefined" || !window.AudioContext) return;

  const context = new window.AudioContext();
  // IMPORTANT NOTE: browsers start the context suspended until playback is
  // unlocked, so an unresumed context plays the cue silently.
  if (context.state === "suspended") void context.resume();
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.frequency.value = 660;
  gain.gain.setValueAtTime(0.06, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + CUE_SECONDS);
  oscillator.connect(gain).connect(context.destination);
  oscillator.onended = () => void context.close();
  oscillator.start();
  oscillator.stop(context.currentTime + CUE_SECONDS);
};
