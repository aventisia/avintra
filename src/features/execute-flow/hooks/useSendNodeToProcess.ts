import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { NodeDataType } from "@/types/node-data-type";
import { toast } from "@aventisia/ui/sonner";
import { Node } from "@xyflow/react";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { WebSocketCommandType, getActivityNodeData } from "..";

export function useSendNodeToProcess(
  sendCommand: (command: WebSocketCommandType, data?: string) => void,
) {
  // Get nodes and edges from ReactFlowExt store
  const { nodes, edges } = useReactFlowExtStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
    })),
  );

  // Send execution complete command
  const executionCompleteHandler = useCallback(
    (isSuccess: boolean) => {
      // Send abort command to stop the execution
      sendCommand("abort");

      // Show a message to the user
      if (isSuccess) {
        toast.info("Execution completed successfully.");
      } else {
        toast.error(
          "Execution failed. Please check the execution logs for details.",
        );
      }
    },
    [sendCommand],
  );

  // Function to find the node and send its data
  const sendNodeToProcess = useCallback(
    (previousNodeId?: string) => {
      // TODO: need to change triggerNode to flowStartNode (FE and BE)
      // Decide on previous node id or find the start node id
      const nodeId =
        previousNodeId || nodes.find((node) => node.type === "triggerNode")?.id;

      // Find node edge -> then get target node id
      const targetNodeId = edges.find((edge) => edge.source === nodeId)?.target;

      // Get the node to which the edge points (target node)
      const targetNode = nodes.find(
        (node) => node.id === targetNodeId,
      ) as Node<NodeDataType>;

      // If target node is flowEndNode then execution is complete
      if (
        !targetNode ||
        !targetNode.type ||
        targetNode.type === "flowEndNode"
      ) {
        executionCompleteHandler(true);
        return;
      }

      // If target node is not found, show an error message
      if (!targetNode) {
        executionCompleteHandler(false);
        return;
      }

      // Get activity node data
      const nodeData = getActivityNodeData(targetNode);

      // Send the command to process the node
      sendCommand("process-node", JSON.stringify(nodeData));
    },
    [nodes, edges, sendCommand, executionCompleteHandler],
  );

  return { sendNodeToProcess };
}
