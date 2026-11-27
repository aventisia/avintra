import { searchUsers, toUserSelectItem } from "@avplatform/ui/apis/search-users-apis";
import { useQuery } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { useCurrentSpaceStore } from "@/stores/current-space-store";
import { getSpaceHeaders } from "@/utils/space-headers";

/**
 * Custom hook to fetch users using react query.
 * @param query - Search keyword for the user name or username.
 * @param onlyTu - When true, restrict results to users who hold the Tenant User role.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useSearchUsersList = (query: string, onlyTu = false) => {
  const { currentSpace } = useCurrentSpaceStore(
    useShallow((state) => ({ currentSpace: state.currentSpace })),
  );

  return useQuery({
    queryKey: ["users-list", query, currentSpace?.id, onlyTu],
    queryFn: () =>
      searchUsers(query, false, true, getSpaceHeaders(), onlyTu).then((res) => ({
        ...res,
        data: (res.data ?? []).map(toUserSelectItem),
      })),

    enabled: !!query,
  });
};
