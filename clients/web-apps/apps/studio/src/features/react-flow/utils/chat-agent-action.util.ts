import { toast } from "@avplatform/ui/sonner";

export const CHAT_AGENT_ACTION_NOT_ALLOWED_MESSAGE = "This action is not available for Chat Agent.";

export const notifyChatAgentActionNotAllowed = () => {
  toast.info(CHAT_AGENT_ACTION_NOT_ALLOWED_MESSAGE);
};
