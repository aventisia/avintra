import { useQuery } from "@tanstack/react-query";
import { getUsers } from "../apis/users-table-apis";
import { DATA_QUERY_KEY } from "../constants/constants";

/**
 * Custom hook to fetch users using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchUsers = () => {
  // Get users using react query
  const { data, isFetching, isLoading } = useQuery({
    queryKey: DATA_QUERY_KEY,
    queryFn: () => getUsers(),
  });

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
