import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { FLOWS_QUERY_KEY, TABLE_TAB_QUERY_PARAM } from "../constants";

/**
 * Returns tab state and query key derived from URL search params.
 *
 * Keeps tab handling logic reusable across features while allowing
 * each feature to provide its own query param and query key.
 */
export const useTableTab = () => {
  const [searchParams] = useSearchParams();

  const currentTab = searchParams.get(TABLE_TAB_QUERY_PARAM) ?? "personal";

  const isPersonal = currentTab === "personal";

  const isShared = currentTab === "shared";

  const isArchived = currentTab === "archived";

  const queryKey = useMemo(
    () => (isPersonal ? [...FLOWS_QUERY_KEY] : [...FLOWS_QUERY_KEY, "SHARED"]),
    [isPersonal],
  );

  return {
    currentTab,
    isPersonal,
    isShared,
    isArchived,
    queryKey,
  };
};
