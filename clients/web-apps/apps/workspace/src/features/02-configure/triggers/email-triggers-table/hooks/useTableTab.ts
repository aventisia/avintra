import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { useCurrentSpaceStore } from "@/stores/current-space-store";
import { useEnvironmentStore } from "@/stores/environment-store";

import { DATA_QUERY_KEY, TABLE_TAB_QUERY_PARAM } from "../constants";

/**
 * Returns tab state and query key derived from URL search params.
 *
 * Keeps tab handling logic reusable across features while allowing
 * each feature to provide its own query param and query key.
 *
 * The returned query key is the single source of truth for the table list
 * query: it always includes the current space id so fetches and mutations
 * resolve the same cache entry.
 */
export const useTableTab = () => {
  const [searchParams] = useSearchParams();

  const { currentSpace } = useCurrentSpaceStore(
    useShallow((state) => ({
      currentSpace: state.currentSpace,
    })),
  );

  const env = useEnvironmentStore((state) => state.env);

  const currentTab = searchParams.get(TABLE_TAB_QUERY_PARAM) ?? "personal";

  const isPersonal = currentTab === "personal";
  const isShared = currentTab === "shared";

  const queryKey = useMemo(
    () => [
      ...(isPersonal ? DATA_QUERY_KEY : [...DATA_QUERY_KEY, "SHARED"]),
      currentSpace?.id ?? "",
      env,
    ],
    [isPersonal, currentSpace?.id, env],
  );

  return {
    currentTab,
    isPersonal,
    queryKey,
    isShared,
  };
};
