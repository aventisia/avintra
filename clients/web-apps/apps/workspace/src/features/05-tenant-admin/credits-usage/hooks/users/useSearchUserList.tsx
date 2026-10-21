import { searchUsers, toUserSelectItem } from "@avplatform/ui/apis/search-users-apis";
import { useQuery } from "@tanstack/react-query";

import { getSpaceHeaders } from "@/utils/space-headers";

/**
 * Custom hook to fetch flow users using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useSearchUserList = (query: string) => {
  return useQuery({
    queryKey: ["user-list", query],
    queryFn: () =>
      searchUsers(query, false, false, getSpaceHeaders()).then((res) => ({
        ...res,
        data: (res.data ?? []).map(toUserSelectItem),
      })),
    enabled: !!query,
  });
};
