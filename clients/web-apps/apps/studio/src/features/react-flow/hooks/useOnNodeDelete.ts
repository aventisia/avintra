import { FlowTypesEnum } from "@avplatform/ui/enums";
import { OnNodesDelete } from "@xyflow/react";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";

import { notifyChatAgentActionNotAllowed } from "@/features/react-flow/utils/chat-agent-action.util";
import { useDagreAutoLayout } from "@/hooks/useDagreAutoLayout";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

import { getNodesAndEdgesAfterDeletion } from "../utils/getNodesAndEdgesAfterDeletion";
import {
  deduplicateEdges,
  getComprehensiveSelection,
  rebuildBypassEdges,
} from "../utils/node-deletion-utils";

export const useOnNodeDelete = () => {
  const {
    nodes,
    edges,
    flowType,
    setNodes,
    setEdges,
    flowVariablesObject,
    setFlowVariablesObject,
  } = useReactFlowExtStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
      flowType: state.flowType,
      setNodes: state.setNodes,
      setEdges: state.setEdges,
      flowVariablesObject: state.flowVariablesObject,
      setFlowVariablesObject: state.setFlowVariablesObject,
    })),
  );

  const autoLayout = useDagreAutoLayout();

  const onNodesDelete: OnNodesDelete = useCallback(
    (deletedNodes) => {
      if (flowType === FlowTypesEnum.ChatAgent) {
        notifyChatAgentActionNotAllowed();
        return;
      }

      try {
        let updatedNodes = [...nodes];
        let updatedEdges = [...edges];
        let updatedFlowVariables = [...flowVariablesObject];

        // 1. Expand selection to include all hidden group members or subgraph bounds
        const deletedIds = deletedNodes.map((n) => n.id);
        const comprehensiveIds = getComprehensiveSelection(deletedIds, updatedNodes, updatedEdges);
        const allNodesToDelete = updatedNodes.filter((n) => comprehensiveIds.includes(n.id));

        // 2. Strip UI temporary edges to prevent traversal crashes
        updatedEdges = updatedEdges.filter((e) => !e.data?.isTemporary);

        // 3. Sort special nodes to be deleted first to cleanly clear subgraphs
        const sortedNodesToDelete = allNodesToDelete.sort((a, b) => {
          const aIsSpecial = a.type === "conditionalNode" || a.type === "forLoopNode";
          const bIsSpecial = b.type === "conditionalNode" || b.type === "forLoopNode";
          if (aIsSpecial && !bIsSpecial) return -1;
          if (!aIsSpecial && bIsSpecial) return 1;
          return 0;
        });

        // 4. Perform sequential mathematical deletion
        sortedNodesToDelete.forEach((nodeToRemove) => {
          if (updatedNodes.some((n) => n.id === nodeToRemove.id)) {
            const result = getNodesAndEdgesAfterDeletion({
              node: nodeToRemove,
              nodes: updatedNodes,
              edges: updatedEdges,
              flowVariables: updatedFlowVariables,
              allowBranchDeletion: true,
            });
            updatedNodes = result.updatedNodes;
            updatedEdges = result.updatedEdges;
            updatedFlowVariables = result.updatedFlowVariables;
          }
        });

        // 5. Adjust group counts if a partial member was deleted
        const groupsAffected = new Map<string, number>();
        allNodesToDelete.forEach((n) => {
          if (n.data?.groupId && !n.data.isGroupHead) {
            const isHeadDeleted = allNodesToDelete.some(
              (cn) => cn.data?.groupId === n.data?.groupId && cn.data?.isGroupHead,
            );
            if (!isHeadDeleted) {
              groupsAffected.set(
                n.data.groupId as string,
                (groupsAffected.get(n.data.groupId as string) || 0) + 1,
              );
            }
          }
        });

        groupsAffected.forEach((removedCount, gId) => {
          const headIndex = updatedNodes.findIndex(
            (n) => n.data?.groupId === gId && n.data?.isGroupHead,
          );
          if (headIndex !== -1) {
            const currentCount = (updatedNodes[headIndex].data.count as number) || 1;
            updatedNodes[headIndex] = {
              ...updatedNodes[headIndex],
              data: {
                ...updatedNodes[headIndex].data,
                count: Math.max(1, currentCount - removedCount),
              },
            };
          }
        });

        // 6. Final safety sweeps and re-layout
        updatedEdges = rebuildBypassEdges(updatedNodes, updatedEdges);
        updatedEdges = deduplicateEdges(updatedEdges);

        setNodes(updatedNodes);
        setEdges(updatedEdges);
        setFlowVariablesObject(updatedFlowVariables ?? []);
        autoLayout({ newNodes: updatedNodes, newEdges: updatedEdges });
      } catch (err) {
        console.warn((err as Error).message);
      }
    },
    [nodes, edges, flowType, flowVariablesObject, autoLayout],
  );

  return { onNodesDelete };
};
