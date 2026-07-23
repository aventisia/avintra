import { IHttpResponse } from "@avplatform/ui/dtos";
import { QueryObserverResult, useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { getSupportTicketRemarks } from "../apis/suport-ticket-remarks-apis";
import { SupportTicketRemarksDto } from "../dtos/SupportTicketRemarksDto";
import { useSupportTicketsTableStore } from "../stores/support-tickets-table-store";

type FetchSTRemarksReturnType = {
  data: IHttpResponse<SupportTicketRemarksDto[]> | undefined;
  isFetching: boolean;
  isLoading: boolean;
  refetch: () => Promise<QueryObserverResult<IHttpResponse<SupportTicketRemarksDto[]>, Error>>;
};

/**
 * Custom hook to fetch assocaited remarks with support ticket using react query.
 * @returns An object containing the fetched data, isFetching flag, isLoading flag, and a refetch function.
 */
export const useFetchSTRemarks = (): FetchSTRemarksReturnType => {
  // Get support ticket id from URL params
  const location = useLocation();
  const id = new URLSearchParams(location.search).get("st") ?? "";

  // Get support tickets store state and actions
  const { remarksQueryKey } = useSupportTicketsTableStore(
    useShallow((state) => ({
      remarksQueryKey: state.remarksQueryKey,
    })),
  );

  // Get support ticket remarks using react query
  const { data, isFetching, isLoading, refetch } = useQuery({
    queryKey: remarksQueryKey,
    queryFn: () => getSupportTicketRemarks(id),
  });

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading, refetch };
};
