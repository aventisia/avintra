import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { useCurrentSpaceStore } from "@/stores/current-space-store";

import { getConversations } from "../apis/conversations-table-apis";
import { DATA_QUERY_KEY } from "../constants";
import { ConversationChannelEnum } from "../enums/conversation-channel.enum";
import { useDateRangePickerStore } from "../stores/date-range-store";

/**
 * Custom hook to fetch Conversations using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchConversationsList = (channel?: ConversationChannelEnum) => {
  // Get the currently selected space so the query refetches when the space changes
  const { currentSpace } = useCurrentSpaceStore(
    useShallow((state) => ({
      currentSpace: state.currentSpace,
    })),
  );

  const { dateRange } = useDateRangePickerStore(
    useShallow((state) => ({ dateRange: state.dateRange })),
  );

  const from = format(dateRange!.from!, "yyyy-MM-dd");
  const to = format(dateRange!.to!, "yyyy-MM-dd");

  // Get Conversations using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: [...DATA_QUERY_KEY, from, to, channel, currentSpace?.id],
    queryFn: () => getConversations(from, to, channel),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
