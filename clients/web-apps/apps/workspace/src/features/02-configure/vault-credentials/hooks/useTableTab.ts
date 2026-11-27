import { DATA_QUERY_KEY, TENANT_DATA_QUERY_KEY } from "../constants";
import { useVaultCredentialScope } from "../contexts/vault-credential-scope.context";

/**
 * Returns the query key used to invalidate the merged vault list.
 *
 * The list merges the current-space (personal) and shared-with-user queries into a
 * single table, so the returned key is the base prefix of both query keys.
 * Invalidating this prefix refetches both lists after a mutation.
 */
export const useTableTab = () => {
  const scope = useVaultCredentialScope();

  return {
    queryKey: scope === "tenant" ? TENANT_DATA_QUERY_KEY : DATA_QUERY_KEY,
  };
};
