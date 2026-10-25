import { TABLE_CN_DEFAULT_QUERY_KEYS } from "@avplatform/ui/table-cn";
import { useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { SHOW_ARCHIVED_QUERY_PARAM, SHOW_ARCHIVED_QUERY_VALUE } from "../constants";

const LEGACY_TAB_QUERY_PARAM = "tab";

/**
 * Whether archived agents are listed, kept in the URL (`archived=1`); hidden by default.
 */
export const useShowArchived = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const showArchived = searchParams.get(SHOW_ARCHIVED_QUERY_PARAM) === SHOW_ARCHIVED_QUERY_VALUE;

  useEffect(() => {
    if (!searchParams.has(LEGACY_TAB_QUERY_PARAM)) return;

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete(LEGACY_TAB_QUERY_PARAM);
    setSearchParams(nextParams, { replace: true, preventScrollReset: true });
  }, [searchParams, setSearchParams]);

  const setShowArchived = useCallback(
    (nextShowArchived: boolean) =>
      setSearchParams(
        (params) => {
          if (nextShowArchived) params.set(SHOW_ARCHIVED_QUERY_PARAM, SHOW_ARCHIVED_QUERY_VALUE);
          else params.delete(SHOW_ARCHIVED_QUERY_PARAM);
          params.delete(TABLE_CN_DEFAULT_QUERY_KEYS.page);
          return params;
        },
        { replace: true, preventScrollReset: true },
      ),
    [setSearchParams],
  );

  return { showArchived, setShowArchived };
};
