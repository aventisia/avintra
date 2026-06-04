import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { DATA_QUERY_KEY, TABLE_TAB_QUERY_PARAM } from "../constants";

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

  const queryKey = useMemo(
    () => (isPersonal ? [...DATA_QUERY_KEY] : [...DATA_QUERY_KEY, "SHARED"]),
    [isPersonal],
  );

  return {
    currentTab,
    isPersonal,
    queryKey,
  };
};
