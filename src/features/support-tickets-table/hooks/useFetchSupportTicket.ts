import { QueryObserverResult, useQuery } from "@tanstack/react-query";
import { getSupportTicket } from "../apis/suport-tickets-table-apis";
import { IHttpResponse } from "@/react-toolkit/dtos/http-response";
import { SupportTicketsTableDto } from "../dtos/SupportTicketsTableDto";
import { TICKET_QUERY_KEY } from "../constants/constants";

/**
 * Custom hook to fetch support ticket details using react query.
 * @param {string} id - The support ticket ID.
 * @returns An object containing the fetched data, isFetching flag, isLoading flag, and refetch function.
 */
export const useFetchSupportTicket: (id: string) => {
  data: IHttpResponse<SupportTicketsTableDto> | undefined;
  isFetching: boolean;
  isLoading: boolean;
  refetch: () => Promise<
    QueryObserverResult<IHttpResponse<SupportTicketsTableDto>, Error>
  >;
} = (id: string) => {
  // Get support ticket using react query
  const { data, isFetching, isLoading, refetch } = useQuery({
    queryKey: [TICKET_QUERY_KEY, id],
    queryFn: () => getSupportTicket(id),
    enabled: !!id, // Only fetch if ID is valid
  });

  return { data, isFetching, isLoading, refetch };
};
