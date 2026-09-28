import { useSearchParams } from "react-router-dom";

import { DATA_QUERY_KEY, TABLE_TAB_QUERY_PARAM } from "../constants/tools-table.constants";

/**
 * Returns whether the Library tab is active and the query key used to invalidate
 * the merged tools list.
 *
 * The default ("all") tab merges the current-space (personal) and shared-with-user
 * lists; the "library" tab shows the platform library. The query key is the base
 * prefix of all three query keys so mutations refetch every list.
 */
export const useTableTab = () => {
  const [searchParams] = useSearchParams();

  const isLibrary = searchParams.get(TABLE_TAB_QUERY_PARAM) === "library";
  const isReadOnly = isLibrary;

  return {
    isLibrary,
    isReadOnly,
    queryKey: DATA_QUERY_KEY,
  };
};
