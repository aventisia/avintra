import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { useCurrentSpaceStore } from "@/stores/current-space-store";

import { getActiveChatAgents, getArchivedChatAgents } from "../apis/assist-chat-agents-apis";

/**
 * Custom hook to fetch active/archived chat agents using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchChatAgents = () => {
  // Get the currently selected space so the query refetches when the space changes
  const { currentSpace } = useCurrentSpaceStore(
    useShallow((state) => ({
      currentSpace: state.currentSpace,
    })),
  );

  const activeQuery = useQuery({
    queryKey: ["chat-agents", "active", currentSpace?.id],
    queryFn: getActiveChatAgents,
  });

  const archivedQuery = useQuery({
    queryKey: ["chat-agents", "archived", currentSpace?.id],
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
