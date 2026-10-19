import { searchUsers, toUserSelectItem } from "@avplatform/ui/apis/search-users-apis";
import { useQuery } from "@tanstack/react-query";

import { getStudioSpaceHeaders, getStudioSpaceId } from "@/utils/space-headers";

/**
 * Custom hook to fetch flow users using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useSearchUserList = (query: string) => {
  return useQuery({
    queryKey: ["flow-user-list", query, getStudioSpaceId()],
    queryFn: () =>
      searchUsers(query, false, true, getStudioSpaceHeaders()).then((res) => ({
        ...res,
        data: (res.data ?? []).map(toUserSelectItem),
      })),
    enabled: !!query,
  });
};
