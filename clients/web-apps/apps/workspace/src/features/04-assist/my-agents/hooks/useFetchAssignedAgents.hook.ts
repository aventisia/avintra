import { toast } from "@avplatform/ui/sonner";
import { useQueries } from "@tanstack/react-query";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { getActiveChatAgents } from "@/features/04-assist/my-chats/apis/assist-chat-agents-apis";
import { AssistChatDto } from "@/features/04-assist/my-chats/dtos/assist-chat.dto";
import { useCurrentSpaceStore } from "@/stores/current-space-store";

import { getMyAgents } from "../apis/agents-assist-apis";
import { AgentsAssistDto } from "../dtos/agent-assist-dto";

type AssignedAgentsSources = {
  /** Published automation agents assigned to the caller's machines. */
  assignedAgents: AgentsAssistDto[];
  /** Published chat and voice agents shared with the caller. */
  sharedChatAgents: AssistChatDto[];
  isLoading: boolean;
};

/**
 * Fetches the rows a TU holder runs from the merged Agents page: the agents assigned to their
 * machines and the chat/voice agents shared with them. Disabled callers make no requests.
 */
export const useFetchAssignedAgents = (enabled: boolean): AssignedAgentsSources => {
  const { currentSpace } = useCurrentSpaceStore(
    useShallow((state) => ({ currentSpace: state.currentSpace })),
  );
  const space = currentSpace?.id;

  const [assigned, chats] = useQueries({
    queries: [
      {
        queryKey: ["agents-assist", space],
        queryFn: getMyAgents,
        enabled,
      },
      {
        queryKey: ["chat-agents", "active", space],
        queryFn: getActiveChatAgents,
        enabled,
      },
    ],
  });

  const error = assigned.error ?? chats.error;

  useEffect(() => {
    if (enabled && (assigned.isError || chats.isError)) {
      toast.error(error?.toString() ?? "Failed to fetch assigned agents");
    }
  }, [enabled, error, assigned.isError, chats.isError]);

  return {
    assignedAgents: assigned.data?.data ?? [],
    sharedChatAgents: chats.data?.data ?? [],
    isLoading: enabled && (assigned.isLoading || chats.isLoading),
  };
};
