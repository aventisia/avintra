import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { setFixedCredits } from "../apis/tenants-table-apis";
import { TENANT_PUBLISHED_AGENTS_QUERY_KEY } from "./useFetchTenantPublishedAgents";

/**
 * Custom hook to set the fixed credits limit for a published agent.
 * @returns The mutation object.
 */
export const useSetFixedCreditsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ flowVersionId, fixedCredits }: { flowVersionId: string; fixedCredits: number | null }) =>
      setFixedCredits(flowVersionId, fixedCredits),

    onSuccess: (httpResponse) => {
      toast.success(httpResponse?.message, {
        className: "sonner-toaster-sm",
      });
      queryClient.invalidateQueries({ queryKey: TENANT_PUBLISHED_AGENTS_QUERY_KEY });
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });
};
