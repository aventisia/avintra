import { IHttpResponse } from "@aventisia/ui/dtos";
import { QueryObserverResult, useQuery } from "@tanstack/react-query";

import { getSupportTickets } from "../apis/suport-tickets-table-apis";
import { DATA_QUERY_KEY } from "../constants/constants";
import { SupportTicketsTableDto } from "../dtos/SupportTicketsTableDto";

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
  // Get support tickets using react query
  const { data, isFetching, isLoading, refetch } = useQuery({
    queryKey: DATA_QUERY_KEY,
    queryFn: getSupportTickets,
  });

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading, refetch };
};
