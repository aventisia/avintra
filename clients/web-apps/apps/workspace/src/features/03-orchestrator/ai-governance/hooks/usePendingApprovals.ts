import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { useCurrentSpaceStore } from "@/stores/current-space-store";

import { getPendingApprovals } from "../apis/agent-risk-registry-apis";
import { AI_GOVERNANCE_DATA_QUERY_KEY } from "../constants";

/**
 * Fetches the registry rows that are pending the current user's approval,
 * providing an "approver inbox" so approvers can see what needs their attention.
 */
export const usePendingApprovals = () => {
  const { currentSpace } = useCurrentSpaceStore(
    useShallow((state) => ({
      currentSpace: state.currentSpace,
    })),
  );

  const query = useQuery({
    queryKey: [...AI_GOVERNANCE_DATA_QUERY_KEY, "pending-approvals", currentSpace?.id],
    queryFn: getPendingApprovals,
  });

  useEffect(() => {
    if (query.isError) toast.error(query.error?.toString() ?? "Failed to load pending approvals.");
  }, [query.error, query.isError]);

  return {
    rows: query.data?.data ?? [],
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    refetch: () => query.refetch(),
  };
};
