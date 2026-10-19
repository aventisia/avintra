import { useUserSessionStore } from "@avplatform/ui/stores";
import { DeploymentType } from "@avplatform/ui/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { getActionSelectorData } from "@/apis/get-action-selector-data.apis";
import { useUsableToolCatalog } from "@/features/dynamic-config-panel/hooks/useTools.hook";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

import { useNodeSelectorStore } from "../stores/action-selector-store";
import { canWeRenderNodeOrCategory } from "../utils/action-visibilty";
import { getCustomTools } from "../utils/custom-tool-actions.util";

/**
 * Fetches and filters action selector data once the session and flow are ready.
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

  const { setActionSelectorData, setCustomToolNodesCount } = useNodeSelectorStore(
    useShallow((state) => ({
      setActionSelectorData: state.setActionSelectorData,
      setCustomToolNodesCount: state.setCustomToolNodesCount,
    })),
  );

  const { data: rawData } = useQuery({
    queryKey: ["action-selector-data"],
    queryFn: getActionSelectorData,
    enabled: !isFlowLoading,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const { data: catalogResponse } = useUsableToolCatalog({ enabled: !isFlowLoading });

  useEffect(() => {
    const catalogTools = catalogResponse?.data;
    const totalNodes = catalogTools
      ? getCustomTools(catalogTools).reduce((sum, tool) => sum + tool.operations.length, 0)
      : null;
    setCustomToolNodesCount(totalNodes);
  }, [catalogResponse, setCustomToolNodesCount]);

  useEffect(() => {
    if (!rawData) return;

    const filtered = rawData.map((primary) => ({
      ...primary,

      actionCategories: primary.actionCategories
        .filter((actionCategory) =>
          canWeRenderNodeOrCategory(actionCategory.doNotRenderIf, deploymentType),
        )

        .map((actionCategory) => ({
          ...actionCategory,

          actions: actionCategory.actions?.filter((action) =>
            canWeRenderNodeOrCategory(action.doNotRenderIf, deploymentType),
          ),
        }))

        .filter((ac) => ac.actions?.length),
    }));

    setActionSelectorData(filtered);
  }, [rawData, deploymentType, setActionSelectorData]);
}
