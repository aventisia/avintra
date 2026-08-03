import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import {
  DATA_QUERY_KEY,
  DEFAULT_TAB,
  TABLE_TAB_QUERY_PARAM,
} from "../constants/tools-table.constants";

/**
 * Returns tab state and query key derived from URL search params.
 */
export const useTableTab = () => {
  const [searchParams] = useSearchParams();

  const currentTab = (searchParams.get(TABLE_TAB_QUERY_PARAM) ?? DEFAULT_TAB) as
    "personal" | "shared" | "library";

  const isPersonal = currentTab === "personal";
  const isShared = currentTab === "shared";
  const isLibrary = currentTab === "library";
  const isReadOnly = isLibrary;

  const queryKey = useMemo(() => {
    if (isShared) return [...DATA_QUERY_KEY, "SHARED"];
    if (isLibrary) return [...DATA_QUERY_KEY, "LIBRARY"];
    return DATA_QUERY_KEY;
  }, [isShared, isLibrary]);

  return {
    currentTab,
    isPersonal,
    isShared,
    isLibrary,
    isReadOnly,
    queryKey,
  };
};
