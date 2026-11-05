import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { getVaultCredentialSelectOptions } from "@/features/02-configure/queues/queues-table/apis/vault-credential-select.apis";
import { VaultCredentialSelectDto } from "@/features/02-configure/queues/queues-table/dtos/vault-credential-select.dto";
import { getVaultCredentialIconSrc } from "@/features/02-configure/vault-credentials/vault-credential-config/utils/vault-credential-icon.util";
import { useCurrentSpaceStore } from "@/stores/current-space-store";
import { useEnvironmentStore } from "@/stores/environment-store";

import { DATA_QUERY_KEY } from "../constants/tools-table.constants";

/**
 * Fetches credentials that can be assigned to a tool.
 *
 * Uses the shared vault credential select-options endpoint filtered to
 * CustomApiTool. This keeps the hook isolated in the tools feature.
 */
export const useFetchCustomApiCredentials = () => {
  // Get the currently selected space so the query refetches when the space changes
  const { currentSpace } = useCurrentSpaceStore(
    useShallow((state) => ({
      currentSpace: state.currentSpace,
    })),
  );

  const env = useEnvironmentStore((state) => state.env);

  const { data, isFetching, isLoading, isError } = useQuery({
    queryKey: [...DATA_QUERY_KEY, "credentials", "custom-api-tool", currentSpace?.id, env],
    queryFn: () => getVaultCredentialSelectOptions("CustomApiTool"),
    staleTime: 60 * 1000,
  });

  const credentials = useMemo(
    () =>
      ((data?.data ?? []) as VaultCredentialSelectDto[]).map((credential) => ({
        ...credential,
        icon: getVaultCredentialIconSrc("CustomApiTool"),
      })),
    [data],
  );

  return { data: credentials, isFetching, isLoading, isError };
};
