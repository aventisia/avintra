import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { useCurrentSpaceStore } from "@/stores/current-space-store";
import { useEnvironmentStore } from "@/stores/environment-store";

import { DATA_QUERY_KEY, TABLE_TAB_QUERY_PARAM } from "../constants";

/**
 * Returns whether the platform default tab is active and the query key of the
 * merged skills list.
 *
 * The default ("all") tab shows the merged personal + shared list returned by a
 * single endpoint; the "platform" tab shows the platform default skills. The
 * query key is the concrete list key so mutations invalidate and optimistically
 * update the cached list.
 */
export const useTableTab = () => {
  const [searchParams] = useSearchParams();

  // Current space id and environment scope the list query key.
  const { currentSpace } = useCurrentSpaceStore(
    useShallow((state) => ({
      currentSpace: state.currentSpace,
    })),
  );

  const env = useEnvironmentStore((state) => state.env);
  const space = currentSpace?.id ?? "";

  const isPlatformTab = searchParams.get(TABLE_TAB_QUERY_PARAM) === "platform";
  const isReadOnly = isPlatformTab;

  // Memoized so the key keeps a stable identity between renders; consumers use it
  // in effect dependencies and as a react-query key.
  const queryKey = useMemo(() => [...DATA_QUERY_KEY, space, env], [space, env]);

  return {
    isPlatformTab,
    isReadOnly,
    queryKey,
  };
};
