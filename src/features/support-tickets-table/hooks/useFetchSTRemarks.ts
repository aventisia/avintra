import { useQuery, QueryObserverResult } from "@tanstack/react-query";
import { SupportTicketRemarksDto } from "../dtos/SupportTicketRemarksDto";
import { IHttpResponse } from "@/react-toolkit/dtos/http-response";
import { useSupportTicketsTableStore } from "../stores/support-tickets-table-store";
import { useShallow } from "zustand/react/shallow";
import { getSupportTicketRemarks } from "../apis/suport-ticket-remarks-apis";
import { useLocation } from "react-router-dom";

type FetchSTRemarksReturnType = {
  data: IHttpResponse<SupportTicketRemarksDto[]> | undefined;
  isFetching: boolean;
  isLoading: boolean;
  refetch: () => Promise<
    QueryObserverResult<IHttpResponse<SupportTicketRemarksDto[]>, Error>
  >;
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
  const { selectedSupportTicket, remarksQueryKey } =
    useSupportTicketsTableStore(
      useShallow((state) => ({
        selectedSupportTicket: state.selectedSupportTicket,
        remarksQueryKey: state.remarksQueryKey,
      })),
    );

  // Get support ticket remarks using react query
  const { data, isFetching, isLoading, refetch } = useQuery({
    queryKey: remarksQueryKey,
    queryFn: () =>
      selectedSupportTicket
        ? getSupportTicketRemarks(selectedSupportTicket.id)
        : getSupportTicketRemarks(id),
  });

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading, refetch };
};
