import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { useCurrentSpaceStore } from "@/stores/current-space-store";
import { useEnvironmentStore } from "@/stores/environment-store";

import {
  DATA_QUERY_KEY,
  DEFAULT_TAB,
  TABLE_TAB_QUERY_PARAM,
} from "../constants/tools-table.constants";

/**
 * Returns tab state and query key derived from URL search params.
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

  const currentTab = (searchParams.get(TABLE_TAB_QUERY_PARAM) ?? DEFAULT_TAB) as
    "personal" | "shared" | "library";

  const isPersonal = currentTab === "personal";
  const isShared = currentTab === "shared";
  const isLibrary = currentTab === "library";
  const isReadOnly = isLibrary;

  const queryKey = useMemo(() => {
    if (isShared) return [...DATA_QUERY_KEY, "SHARED", currentSpace?.id ?? "", env];
    if (isLibrary) return [...DATA_QUERY_KEY, "LIBRARY", currentSpace?.id ?? "", env];
    return [...DATA_QUERY_KEY, currentSpace?.id ?? "", env];
  }, [isShared, isLibrary, currentSpace?.id, env]);

  return {
    currentTab,
    isPersonal,
    isShared,
    isLibrary,
    isReadOnly,
    queryKey,
  };
};
