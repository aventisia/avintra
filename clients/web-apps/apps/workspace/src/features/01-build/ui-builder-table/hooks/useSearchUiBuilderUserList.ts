import { searchUsers } from "@avplatform/ui/apis/search-users-apis";
import { useQuery } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { useCurrentSpaceStore } from "@/stores/current-space-store";
import { getSpaceHeaders } from "@/utils/space-headers";

/**
 * Searches tenant users for the UI builder project assignment dialog.
 */
export const useSearchUiBuilderUserList = (query: string) => {
  const { currentSpace } = useCurrentSpaceStore(
    useShallow((state) => ({
      currentSpace: state.currentSpace,
    })),
  );

  return useQuery({
    queryKey: ["ui-builder-users-list", query, currentSpace?.id],
    queryFn: () => searchUsers(query, true, false, getSpaceHeaders()),
    enabled: !!query,
  });
};
