import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { ConditionalNodeDataType } from "@/types/conditional-node-data-type";
import { NodeDataType } from "@/types/node-data-type";
import { toast } from "@aventisia/ui/sonner";
import { Node } from "@xyflow/react";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  WebSocketCommandType,
  getActivityNodeData,
  useProcessConditionalNode,
} from "..";

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

  // Get process conditional node hook
  const { processConditionalNode } = useProcessConditionalNode(sendCommand);

  // Get node Id to process
  const getNextNodeIdToProcess = (previousNodeId?: string) => {
    // TODO: need to change triggerNode to flowStartNode (FE and BE)
    // Decide on previous node id or find the start node id
    const nodeId =
      previousNodeId || nodes.find((node) => node.type === "triggerNode")?.id;

    // Find node edge -> then get target node id
    const targetNodeId = edges.find((edge) => edge.source === nodeId)?.target;

    // Send the target node id to process
    sendNodeToProcess(targetNodeId || "nodeId");
  };

  // Send execution complete command
  const sendExecutionComplete = useCallback(
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
    (nodeId: string) => {
      // Get node first
      const nodeToProcess = nodes.find((node) => node.id === nodeId);

      // If target node is not found, show an error message
      if (!nodeToProcess || !nodeToProcess.type) {
        sendExecutionComplete(false);
        return;
      }

      // Check the type of the target node and handle accordingly
      switch (nodeToProcess.type) {
        case "triggerNode": // Start node
          getNextNodeIdToProcess();
          return;
        case "plusNode": // Empty node, go to next node
        case "mergeBranchesNode": // Conditional or loop ends, go to next node
        case "branchStartNode": // Placeholder node, go to next node. We can remove this node later
        case "branchNode1": // Conditional branch node. Check condition. branch node id is passed which means condition is checked and its true so we'll start the branch processing
          getNextNodeIdToProcess(nodeToProcess.id);
          return;
        case "activityNode": // Get activity node data -> Send the command to websocket
          sendCommand(
            "process-node",
            JSON.stringify(
              getActivityNodeData(nodeToProcess as Node<NodeDataType>),
            ),
          );
          return;
        case "conditionalNode": // Save conditional mode (SwitchCase or nestedIfElse) in store and pick the branch node as per execution state
          processConditionalNode(
            nodeToProcess as Node<ConditionalNodeDataType>,
          );
          return;
        case "whileLoopNode": // While loop. Check condition
          sendCommand("check-condition", nodeToProcess.id);
          return;
        case "forLoopNode": // loop. Check condition
          sendCommand("resume");
          return;
        case "flowEndNode": // Execution is complete
          sendExecutionComplete(true);
          return;
        default: // If unknown node type, show an error message
          toast.error(
            `Unknown node type: ${nodeToProcess.type}. Please check the flow.`,
          );
          sendExecutionComplete(false);
          return;
      }
    },
    [nodes, processConditionalNode, sendCommand, sendExecutionComplete],
  );

  return { sendNodeToProcess };
}
