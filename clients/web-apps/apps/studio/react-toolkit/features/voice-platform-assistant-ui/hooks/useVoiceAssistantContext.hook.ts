import { useContext } from "react";

import {
  VoiceAssistantContext,
  VoiceAssistantContextValue,
} from "../context/voice-assistant.context";

/** Reads the mounted voice controller, or null when the voice surface is not mounted. */
export const useVoiceAssistantContext = (): VoiceAssistantContextValue | null =>
  useContext(VoiceAssistantContext);
