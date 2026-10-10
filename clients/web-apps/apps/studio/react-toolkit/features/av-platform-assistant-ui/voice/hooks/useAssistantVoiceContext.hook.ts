import { useContext } from "react";

import {
  AssistantVoiceContext,
  AssistantVoiceContextValue,
} from "../context/assistant-voice.context";

/** Reads the mounted voice controller, or null when the chat UI mounted without voice. */
export const useAssistantVoiceContext = (): AssistantVoiceContextValue | null =>
  useContext(AssistantVoiceContext);
