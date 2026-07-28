import { useQuery } from "@tanstack/react-query";
import { getSearchUser } from "../apis/share-flow-apis";

/**
 * Custom hook to fetch flow users using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useSearchUserList = (query: string) => {
  return useQuery({
    queryKey: ["flow-user-list", query],
    queryFn: () => getSearchUser(query),
    enabled: !!query,
  });
};
