import { useQuery, QueryObserverResult } from "@tanstack/react-query";
import {
  getAllSupportTickets,
  getSupportTickets,
} from "../apis/suport-tickets-table-apis";
import { DATA_QUERY_KEY } from "../constants/constants";
import { useSupportTicketsTableStore } from "../stores/support-tickets-table-store";
import { useShallow } from "zustand/react/shallow";
import { SupportTicketsTableDto } from "../dtos/SupportTicketsTableDto";
import { IHttpResponse } from "@/react-toolkit/dtos/http-response";

type FetchSupportTicketsReturnType = {
  data: IHttpResponse<SupportTicketsTableDto[]> | undefined;
  isFetching: boolean;
  isLoading: boolean;
  refetch: () => Promise<
    QueryObserverResult<IHttpResponse<SupportTicketsTableDto[]>, Error>
  >;
};

/**
 * Custom hook to fetch support tickets using react query.
 * @returns An object containing the fetched data, isFetching flag, isLoading flag, and a refetch function.
 */
export const useFetchSupportTickets = (): FetchSupportTicketsReturnType => {
  // Access user role from the store
  const { userRole } = useSupportTicketsTableStore(
    useShallow((state) => ({
      userRole: state.userRole,
    })),
  );

  // Determine the appropriate query function based on userRole
  const queryFn =
    userRole === "Reviewer" ? getAllSupportTickets : getSupportTickets;

  // Get support tickets using react query
  const { data, isFetching, isLoading, refetch } = useQuery({
    queryKey: DATA_QUERY_KEY,
    queryFn,
  });

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading, refetch };
};
