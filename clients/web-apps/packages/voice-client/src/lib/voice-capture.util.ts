import type { AudioCaptureOptions } from "livekit-client";

import type { VoiceNoiseCancellation } from "../types/voice-session.type";

/**
 * Maps the resolved noise-cancellation mode to browser capture constraints.
 *
 * IMPORTANT NOTE: enhanced cancellation (standard/telephony) is not implemented,
 * so those modes capture with browser processing off.
 */
export const captureOptionsFor = (mode: VoiceNoiseCancellation): AudioCaptureOptions => {
  const enabled = mode === "auto";
  return { noiseSuppression: enabled, echoCancellation: enabled, autoGainControl: enabled };
};
