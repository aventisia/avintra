import { toast } from "@aventisia/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import {
  getActiveChatAgents,
  getArchivedChatAgents,
} from "../apis/assist-chat-agents-apis";

/**
 * Custom hook to fetch active/archived chat agents using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchChatAgents = () => {
  const activeQuery = useQuery({
    queryKey: ["chat-agents", "active"],
    queryFn: getActiveChatAgents,
  });

  const archivedQuery = useQuery({
    queryKey: ["chat-agents", "archived"],
    queryFn: getArchivedChatAgents,
  });

  // Show toast on fetch error
  useEffect(() => {
    if (activeQuery.isError) toast.error(activeQuery.error.toString());
  }, [activeQuery.error, activeQuery.isError]);

  return {
    active: activeQuery,
    archived: archivedQuery,
  };
};
