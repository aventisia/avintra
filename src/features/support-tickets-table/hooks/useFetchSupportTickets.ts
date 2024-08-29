import { useQuery } from "@tanstack/react-query";
import { getSupportTickets } from "../apis/suport-tickets-table-apis";
import { DATA_QUERY_KEY } from "../constants/constants";

/**
 * Custom hook to fetch support tickets using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchSupportTickets = () => {
  // Get support tickets using react query
  const { data, isFetching, isLoading } = useQuery({
    queryKey: DATA_QUERY_KEY,
    queryFn: () => getSupportTickets(),
  });

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
