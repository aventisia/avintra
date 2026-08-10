import { useQuery } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { useCurrentSpaceStore } from "@/stores/current-space-store";

import { getSearchUser } from "../apis/queue-users-apis";

/**
 * Custom hook to fetch users using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useSearchUsersList = (query: string) => {
  // Get the currently selected space so the query refetches when the space changes
  const { currentSpace } = useCurrentSpaceStore(
    useShallow((state) => ({
      currentSpace: state.currentSpace,
    })),
  );

  return useQuery({
    queryKey: ["users-list", query, currentSpace?.id],
    queryFn: () => getSearchUser(query),

    enabled: !!query,
  });
};
