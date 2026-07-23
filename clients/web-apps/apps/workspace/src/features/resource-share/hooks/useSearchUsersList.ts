import { useQuery } from "@tanstack/react-query";

import { getSearchUser } from "../apis/resource-share-apis";

/**
 * Custom hook to fetch users using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useSearchUsersList = (query: string) => {
  return useQuery({
    queryKey: ["users-list", query],
    queryFn: () => getSearchUser(query),

    enabled: !!query,
  });
};
