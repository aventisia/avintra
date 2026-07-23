import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getConversationsById } from "../apis/conversations-table-apis";

/**
 * Custom hook to fetch Conversation details using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchConversationDetails = (id?: string) => {
  // Get Conversations using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: ["Conversations-details", id],
    queryFn: () => getConversationsById(id),
    enabled: !!id,
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
