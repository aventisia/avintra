import { DATA_QUERY_KEY } from "../constants";

/**
 * Returns the query key used to invalidate the merged queue list.
 *
 * The queue list merges the current-space (personal) and shared-with-user queries
 * into a single table, so the returned key is the base prefix of both query keys.
 * Invalidating this prefix refetches both lists after a mutation.
 */
export const useTableTab = () => {
  return {
    queryKey: DATA_QUERY_KEY,
  };
};
