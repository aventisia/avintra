import { useContext } from "react";

import {
  type VoiceAssistantContextValue,
  VoiceAssistantContext,
} from "../context/voice-assistant.context";

/** Reads the mounted voice controller, or null when the voice surface is not mounted. */
export const useVoiceAssistantContext = (): VoiceAssistantContextValue | null =>
  useContext(VoiceAssistantContext);
