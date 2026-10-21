import { FlowTypesEnum } from "@avplatform/ui/enums/flow-types-enum";
import { useDebounce } from "@avplatform/ui/hooks/useDebounce";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { searchFlow } from "@/features/search-by-query/apis/search-flow.apis";

import {
  ASSIGNABLE_FLOW_TYPES,
  RESOURCE_FLOW_SEARCH_KEY,
} from "../constants/resource-flow-access.constant";
import type { FlowAccessAgent } from "../types/flow-access.type";

/**
 * Searches the agents that can be assigned to a resource. An empty query returns the most
 * recently created agents, so the list can be browsed before typing.
 */
export const useSearchAssignableFlows = (
  query: string,
  {
    types = ASSIGNABLE_FLOW_TYPES,
    enabled = true,
  }: { types?: FlowTypesEnum[]; enabled?: boolean } = {},
) => {
  const trimmedQuery = query.trim();
  const debouncedQuery = useDebounce(trimmedQuery, 250);

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: [RESOURCE_FLOW_SEARCH_KEY, debouncedQuery, types],
    queryFn: () => searchFlow(debouncedQuery, types),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });

  const results = useMemo<FlowAccessAgent[]>(
    () =>
      (data?.data ?? []).map((option) => ({
        id: option.value,
        name: option.label,
        type: option.type,
        versionCount: option.versionCount,
        lastModifiedOn: option.lastModifiedOn,
      })),
    [data],
  );

  return {
    results,
    debouncedQuery,
    isLoading,
    isError,
    isSearching: isFetching || trimmedQuery !== debouncedQuery,
  };
};
