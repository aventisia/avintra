import { useArchiveAgentAction as useSharedArchiveAgentAction } from "@avplatform/agents";
import type { AgentArchiveTarget } from "@avplatform/agents";
import { axiosInstance } from "@avplatform/ui/lib";
import { useShallow } from "zustand/react/shallow";

import { DATA_QUERY_KEY } from "@/features/flow-versions/constants";
import { FLOWS_QUERY_KEY } from "@/features/flows-popover/constants/constants";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { getStudioSpaceHeaders } from "@/utils/space-headers";

/**
 * Archive or Unarchive action of the open agent, shared with the workspace agents table.
 */
export const useArchiveAgentAction = () => {
  const { currentFlow, setCurrentFlow } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
      setCurrentFlow: state.setCurrentFlow,
    })),
  );

  const { requestArchive, requestUnarchive } = useSharedArchiveAgentAction({
    client: axiosInstance,
    getSpaceHeaders: getStudioSpaceHeaders,
    refreshQueryKeys: [FLOWS_QUERY_KEY, DATA_QUERY_KEY],
    onArchiveSettled: (flowId, archive) => {
      const openFlow = useCurrentFlowStore.getState().currentFlow;
      if (openFlow.id === flowId) setCurrentFlow({ ...openFlow, isArchived: archive });
    },
  });

  const openAgent: AgentArchiveTarget = {
    id: currentFlow.id,
    name: currentFlow.name,
    isPublished: currentFlow.isPublished,
  };

  return {
    isArchived: currentFlow.isArchived,
    requestArchive: () => requestArchive(openAgent),
    requestUnarchive: () => requestUnarchive(openAgent),
  };
};
