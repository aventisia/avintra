import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { ConditionalNodeDataType } from "@/types/conditional-node-data-type";
import { Node } from "@xyflow/react";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { getConditionNodeData } from "..";

// You can only send check-condition command with branch node data
export function useProcessConditionalNode(
  sendCommand: (command: "check-condition", data?: string) => void,
) {
  // Get state and action from current flow store
  const { executionGroup, setExecutionGroup } = useCurrentFlowStore(
    useShallow((state) => ({
      executionGroup: state.executionGroup,
      setExecutionGroup: state.setExecutionGroup,
    })),
  );

  const processConditionalNode = useCallback(
    (node: Node<ConditionalNodeDataType>) => {
      // Invalid node
      if (!node || node.type !== "conditionalNode") return;

      // Set execution group (conditional or loop)
      if (!executionGroup) {
        // Get conditional node data
        const conditionalNodeData = getConditionNodeData(node);

        // Set execution group with conditional node data
        setExecutionGroup(conditionalNodeData);

        // Get first branch node Id
        const firstBranchNodeId = conditionalNodeData.branches[0];
        sendCommand(
          "check-condition",
          firstBranchNodeId, 
        );
      }
    },
    [executionGroup, sendCommand, setExecutionGroup],
  );

  return { processConditionalNode };
}
