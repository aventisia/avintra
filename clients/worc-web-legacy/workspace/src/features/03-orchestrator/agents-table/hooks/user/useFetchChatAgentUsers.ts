import { toast } from "@aventisia/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getChatAgentUsers } from "../../apis/chat-agents-users-apis";
import { CHAT_AGENT_USER_KEY } from "../../constants";

/**
 * Custom hook to fetch queue users using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchChatAgentUsers = (flowVersionId: string) => {
  // Get users using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: [CHAT_AGENT_USER_KEY, flowVersionId],
    queryFn: () => getChatAgentUsers(flowVersionId),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
