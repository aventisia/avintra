import { useQuery } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { useCurrentSpaceStore } from "@/stores/current-space-store";

import { getSearchUiBuilderUser } from "../apis/ui-builder-users-apis";

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
    queryFn: () => getSearchUiBuilderUser(query),
    enabled: !!query,
  });
};
