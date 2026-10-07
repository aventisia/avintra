import { useContext } from "react";

import {
  AssistantVoiceContext,
  AssistantVoiceContextValue,
} from "../context/assistant-voice.context";

/**
 * Reads the mounted voice controller, or null when the surrounding chat UI was
 * mounted without voice (e.g. the Workspace app). Consumers must degrade
 * gracefully instead of assuming voice is present.
 */
export const useAssistantVoiceContext = (): AssistantVoiceContextValue | null =>
  useContext(AssistantVoiceContext);
