import { useQuery } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { useCurrentSpaceStore } from "@/stores/current-space-store";

import { getSearchPublishedUiUser } from "../apis/published-uis-apis";

/**
 * Searches tenant users for the published UI builder project assignment dialog.
 */
export const useSearchPublishedUiUserList = (query: string) => {
  const { currentSpace } = useCurrentSpaceStore(
    useShallow((state) => ({
      currentSpace: state.currentSpace,
    })),
  );

  return useQuery({
    queryKey: ["published-ui-users-list", query, currentSpace?.id],
    queryFn: () => getSearchPublishedUiUser(query),
    enabled: !!query,
  });
};
