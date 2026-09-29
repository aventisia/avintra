import { useSearchParams } from "react-router-dom";

import { FLOWS_QUERY_KEY, TABLE_TAB_QUERY_PARAM } from "../constants";

/**
 * Returns the active flows tab and the query key used to invalidate the merged
 * agents list.
 *
 * The default ("all") tab merges the current-space (personal) and shared-with-user
 * lists; the "archived" tab shows archived agents. The query key is the base prefix
 * of both list query keys so mutations refetch both.
 */
export const useTableTab = () => {
  const [searchParams] = useSearchParams();

  const currentTab = searchParams.get(TABLE_TAB_QUERY_PARAM) === "archived" ? "archived" : "all";
  const isArchived = currentTab === "archived";

  return {
    currentTab,
    isArchived,
    queryKey: FLOWS_QUERY_KEY,
  };
};
