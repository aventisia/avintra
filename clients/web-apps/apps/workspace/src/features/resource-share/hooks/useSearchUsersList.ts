import { searchUsers, toUserSelectItem } from "@avplatform/ui/apis/search-users-apis";
import { useQuery } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { useCurrentSpaceStore } from "@/stores/current-space-store";
import { getSpaceHeaders } from "@/utils/space-headers";

/**
 * Custom hook to fetch users using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useSearchUsersList = (query: string) => {
  const { currentSpace } = useCurrentSpaceStore(
    useShallow((state) => ({ currentSpace: state.currentSpace })),
  );

  return useQuery({
    queryKey: ["users-list", query, currentSpace?.id],
    queryFn: () =>
      searchUsers(query, false, true, getSpaceHeaders()).then((res) => ({
        ...res,
        data: (res.data ?? []).map(toUserSelectItem),
      })),

    enabled: !!query,
  });
};
