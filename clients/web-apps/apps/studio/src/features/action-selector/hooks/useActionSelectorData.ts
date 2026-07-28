// hooks/useActionSelectorData.ts
import { DeploymentType } from "@avplatform/ui/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { getActionSelectorData } from "@/apis/get-action-selector-data";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

import { useNodeSelectorStore } from "../stores/action-selector-store";
import { canWeRenderNodeOrCategory } from "../utils/action-visibilty";

/**
 * Fetches and filters action selector data lazily — only after:
 *   1. The user session has resolved
 *   2. ReactFlow's data has finished loading (`isFlowLoading === false`)
 *
 * React Query caches the result for the session lifetime (`staleTime`
 * and `gcTime` both Infinity), so this only ever fetches once —
 * regardless of how many times `isFlowLoading` toggles afterwards.
 *
 * isFlowLoading - true while ReactFlow's own data is still loading;
 *                        the action selector fetch waits for this to flip false
 */
export function useActionSelectorData() {
  const { isFlowLoading } = useCurrentFlowStore(
    useShallow((state) => ({
      isFlowLoading: state.isFlowLoading,
    })),
  );

  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const deploymentType = userSession?.deploymentType as DeploymentType;

  const { setActionSelectorData } = useNodeSelectorStore(
    useShallow((state) => ({
      setActionSelectorData: state.setActionSelectorData,
    })),
  );

  const { data: rawData } = useQuery({
    queryKey: ["action-selector-data"],
    queryFn: getActionSelectorData,
    // Fetch only once session is resolved AND ReactFlow has finished
    // loading its own data — this is what makes the fetch "lazy,
    // after ReactFlow is ready" instead of racing it on mount.
    enabled: !isFlowLoading,
    staleTime: Infinity, // never refetch automatically — fetch once per session
    gcTime: Infinity, // keep cached for the lifetime of the session
  });

  /**
   * Sync filtered result into Zustand once raw data arrives.
   * Filtering is kept here (not in queryFn) so the cache stores the
   * unfiltered source — cheap to recompute if deploymentType changes,
   * with no extra network round-trip.
   */
  useEffect(() => {
    if (!rawData) return;

    // Filter Action Categories based on visibility
    const filtered = rawData.map((primary) => ({
      ...primary,

      // Filter Action Categories based on visibility
      actionCategories: primary.actionCategories
        .filter((actionCategory) =>
          canWeRenderNodeOrCategory(
            actionCategory.doNotRenderIf,
            deploymentType,
          ),
        )

        // For visible categories, also filter individual actions
        .map((actionCategory) => ({
          ...actionCategory,

          actions: actionCategory.actions?.filter((action) =>
            canWeRenderNodeOrCategory(action.doNotRenderIf, deploymentType),
          ),
        }))

        // Remove categories that end up with no actions
        .filter((ac) => ac.actions?.length),
    }));

    setActionSelectorData(filtered);
  }, [rawData, deploymentType, setActionSelectorData]);
}
