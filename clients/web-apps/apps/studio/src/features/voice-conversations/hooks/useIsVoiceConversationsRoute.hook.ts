import { useLocation } from "react-router-dom";

export const VOICE_CONVERSATIONS_PATH = "/agent-conversations";

export const useIsVoiceConversationsRoute = (): boolean =>
  useLocation().pathname.endsWith(VOICE_CONVERSATIONS_PATH);
