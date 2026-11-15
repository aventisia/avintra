import { FlowTypesEnum } from "@avplatform/ui/enums";
import { toast } from "@avplatform/ui/sonner";

import { notifyChatAgentActionNotAllowed } from "./chat-agent-action.util";

export const VOICE_AGENT_ACTION_NOT_ALLOWED_MESSAGE =
  "This action is not available for Voice Agent.";

/** Returns true when the flow type is locked to a single non-editable AI node. */
export const isSingleNodeAgentFlow = (flowType: FlowTypesEnum): boolean =>
  flowType === FlowTypesEnum.ChatAgent || flowType === FlowTypesEnum.VoiceAgent;

/** Shows the action-not-allowed toast for the current single-node flow type. */
export const notifySingleNodeAgentActionNotAllowed = (flowType: FlowTypesEnum) => {
  if (flowType === FlowTypesEnum.VoiceAgent) {
    toast.info(VOICE_AGENT_ACTION_NOT_ALLOWED_MESSAGE);
    return;
  }

  notifyChatAgentActionNotAllowed();
};
