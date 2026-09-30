import { type QueryClient, type QueryKey } from "@tanstack/react-query";

/**
 * Reads every cached query whose key starts with `queryKey` and merges their
 * `data` arrays into a single `{ data }` payload.
 *
 * The merged Personal/Shared/Library tables cache each list under a distinct key
 * that shares a common prefix (e.g. `["skill", space, env]` and
 * `["skill", "SHARED", space, env]`), while `useTableTab` exposes only that
 * prefix because it is used to invalidate every list at once.
 *
 * Dialog forms need the merged rows, so they must resolve a record through this
 * helper instead of `queryClient.getQueryData(queryKey)`, which matches an exact
 * cache key and therefore never finds a value for a prefix.
 *
 * @param queryClient React Query client instance.
 * @param queryKey Base/prefix query key that all list queries share.
 * @returns A `{ data }` payload with the merged rows, or `undefined` when no list
 *          has resolved yet (so callers can keep their loading state).
 */
export const getMergedQueryData = <T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
): { data: T[] } | undefined => {
  const entries = queryClient.getQueriesData<{ data?: T[] }>({ queryKey });

  // No list has resolved yet: preserve the "still loading" state for callers.
  if (!entries.some(([, data]) => data)) return undefined;

  return { data: entries.flatMap(([, data]) => data?.data ?? []) };
};
