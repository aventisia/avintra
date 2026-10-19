import { searchUsers, toUserSelectItem } from "@avplatform/ui/apis/search-users-apis";
import { useQuery } from "@tanstack/react-query";

/**
 * Custom hook to fetch users using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useSearchUsersList = (query: string) => {
  return useQuery({
    queryKey: ["users-list", query],
    queryFn: () =>
      searchUsers(query, false, true).then((res) => ({
        ...res,
        data: (res.data ?? []).map(toUserSelectItem),
      })),

    enabled: !!query,
  });
};
