import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import type { UseDebouncedSearchParams, UseDebouncedSearchReturn } from "./types";

/**
 * Internal hook to debounce a value.
 */
function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Manages search input state and performs a debounced react-query request.
 */
export const useDebouncedSearch = <TData, TFilters = undefined>({
  queryKeyBase,
  fetcher,
  filters,
  debounceMs = 500,
  minChars = 1,
  enabled = true,
  initialSearchTerm = "",
}: UseDebouncedSearchParams<TData, TFilters>): UseDebouncedSearchReturn<TData> => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);

  const normalizedQuery = useMemo(() => debouncedSearchTerm.trim(), [debouncedSearchTerm]);

  const normalizedQueryKey = Array.isArray(queryKeyBase) ? queryKeyBase : [queryKeyBase];

  const query = useQuery({
    queryKey: [...normalizedQueryKey, normalizedQuery, filters],
    queryFn: () => fetcher(normalizedQuery, filters),
    enabled: enabled && normalizedQuery.length >= minChars,
  });

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm: normalizedQuery,
    ...query,
  };
};
