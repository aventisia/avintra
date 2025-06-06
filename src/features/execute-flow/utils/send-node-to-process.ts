import { ConditionalNodeDataType } from "@/types/conditional-node-data-type";
import { LoopNodeDataType } from "@/types/loop-node-data-type";
import { NodeDataType } from "@/types/node-data-type";
import { toast } from "@aventisia/ui/sonner";
import { Edge, Node } from "@xyflow/react";
import {
  ConditionalNodeData,
  WebSocketCommandType,
  getActivityNodeData,
  getConditionNodeData,
} from "..";
import { LoopNodeData } from "../types/loop-node-data";
import { getConditionalBranchNodeData } from "./get-conditional-branch-node-data";
import { getLoopNodeData } from "./get-loop-node-data";
import { getWpfLoopNodeData } from "./get-wpf-loop-node-data";

// Get nodes from local storage
const getNodesFromLS = () => {
  const storedNodes = localStorage.getItem("nodes");
  return storedNodes ? (JSON.parse(storedNodes) as Node[]) : [];
};

// Get edges from local storage
const getEdgesFromLS = () => {
  const storedEdges = localStorage.getItem("edges");
  return storedEdges ? (JSON.parse(storedEdges) as Edge[]) : [];
};

// Get conditional execution group from local storage
const getConditionalExecutionGroupFromLS = () => {
  const storedGroup = localStorage.getItem("conditionalExecutionGroup");
  return storedGroup ? (JSON.parse(storedGroup) as ConditionalNodeData[]) : [];
};

// Get loop execution group from local storage
const getLoopExecutionGroupFromLS = () => {
  const storedGroup = localStorage.getItem("loopExecutionGroup");
  return storedGroup ? (JSON.parse(storedGroup) as LoopNodeData[]) : [];
};

// Send next node Id to process
const sendNextNodeToProcess = (
  sendCommand: (command: WebSocketCommandType, data?: string) => void,
  currentNodeId?: string,
) => {
  // TODO: need to change triggerNode to flowStartNode (FE and BE)
  // Decide on previous node id or find the start node id
  const nodeId =
    currentNodeId ||
    getNodesFromLS().find((node) => node.type === "triggerNode")?.id;

  // Find node edge -> then get target node id
  const targetNodeId = getEdgesFromLS().find(
    (edge) =>
      edge.source === nodeId &&
      (edge.sourceHandle === undefined ||
        edge.sourceHandle !== "branch-return"),
  )?.target;

  // Send node to process
  sendNodeToProcess(targetNodeId || "nodeId", sendCommand);
};

// Send execution complete command
const sendExecutionComplete = (
  isSuccess: boolean,
  sendCommand: (command: WebSocketCommandType, data?: string) => void,
) => {
  // Send abort command to stop the execution
  sendCommand("abort");

  // Remove the items from local storage
  localStorage.removeItem("nodes");
  localStorage.removeItem("edges");
  localStorage.removeItem("conditionalExecutionGroup");
  localStorage.removeItem("loopExecutionGroup");

  // Show a message to the user
  if (isSuccess) {
    toast.success("Execution completed successfully.");
  } else {
    toast.error(
      "Execution failed. Please check the execution logs for details.",
    );
  }
};

// Function to process conditional node
const processConditionalNode = (
  node: Node<ConditionalNodeDataType>,
  isBranchProcessed: boolean = false,
  sendCommand: (command: WebSocketCommandType, data?: string) => void,
) => {
  // Invalid node
  if (!node || node.type !== "conditionalNode") return;

  let branchId: string;

  // Get execution group
  const currentExecutionGroup = getConditionalExecutionGroupFromLS().find(
    (item) => item.id === node.id,
  ) as ConditionalNodeData;

  // Set execution group
  if (!currentExecutionGroup) {
    // Get conditional node data
    const conditionalNodeData = getConditionNodeData(node);

    // Set branch id to process
    branchId = conditionalNodeData.branches[0];

    // Slice the branchId from conndtionalNodeData
    conditionalNodeData.branches = conditionalNodeData.branches.slice(1);

    // Add conditionalNodeData to execution group
    const newExecutionGroup = [
      ...getConditionalExecutionGroupFromLS(),
      conditionalNodeData,
    ];

    // Set execution group with conditional node data
    localStorage.setItem(
      "conditionalExecutionGroup",
      JSON.stringify(newExecutionGroup),
    );
  } else {
    // If branch is processed and condtionalMode is SwitchCase, then exit the conditional group processing
    if (
      (isBranchProcessed &&
        currentExecutionGroup.conditionalMode === "SwitchCase") ||
      currentExecutionGroup.branches.length === 0
    ) {
      // Send mergeBranchesNode to process
      sendNodeToProcess(currentExecutionGroup.mergeBranchesNodeId, sendCommand);

      // If processing left, remove the conditional node data from execution group
      localStorage.setItem(
        "conditionalExecutionGroup",
        JSON.stringify(
          getConditionalExecutionGroupFromLS().filter(
            (item) => item.id !== node.id,
          ),
        ),
      );

      return;
    }

    // Set branch id to process
    branchId = currentExecutionGroup.branches[0];

    // Slice the branchId from currentExecutionGroup
    const conditionalNodeData = {
      ...currentExecutionGroup,
      branches: currentExecutionGroup.branches.slice(1),
    };

    // Update execution group with new branches
    localStorage.setItem(
      "conditionalExecutionGroup",
      JSON.stringify(
        getConditionalExecutionGroupFromLS().map((item) =>
          item.id === node.id ? conditionalNodeData : item,
        ),
      ),
    );
  }

  // Get branch node
  const branchNode = getNodesFromLS().find(
    (node) => node.id === branchId,
  ) as Node<NodeDataType>;

  // Get next node id from edges
  const nextNodeId =
    getEdgesFromLS().find((edge) => edge.source === branchNode?.id)?.target ??
    "nextNodeId";

  // If branch is default branch, then send next node to process
  if (branchNode.data.name === "DefaultBranch") {
    sendNextNodeToProcess(sendCommand, branchNode.id);
    return;
  }

  // Send branch to check condition
  if (sendCommand) {
    sendCommand(
      "check-condition",
      JSON.stringify(
        getConditionalBranchNodeData(branchNode, node.id, nextNodeId),
      ),
    );
  }
};

// Function to process loop node
const processLoopNode = (
  node: Node<LoopNodeDataType>,
  sendCommand: (command: WebSocketCommandType, data?: string) => void,
) => {
  // Invalid node
  if (!node || node.type !== "forLoopNode") return;

  // Get execution group
  const currentExecutionGroup = getLoopExecutionGroupFromLS().find(
    (item) => item.id === node.id,
  ) as LoopNodeData;

  // Set execution group
  if (!currentExecutionGroup) {
    // Get loop node data
    const loopNodeData = getLoopNodeData(node);

    // Add loopNodeData to execution group
    const newExecutionGroup = [...getLoopExecutionGroupFromLS(), loopNodeData];

    // Set execution group with loop node data
    localStorage.setItem(
      "loopExecutionGroup",
      JSON.stringify(newExecutionGroup),
    );
  }

  // Get next node id from edges
  const nextNodeId =
    getEdgesFromLS().find((edge) => edge.source === node.id)?.target ??
    "nextNodeId";

  // Send loop node to check condition
  sendCommand(
    "check-loop-condition",
    JSON.stringify(getWpfLoopNodeData(node, nextNodeId)),
  );
};

// Function to find the node and send its data
const sendNodeToProcess = (
  nodeId: string,
  sendCommand: (command: WebSocketCommandType, data?: string) => void,
) => {
  // Get node first
  const nodeToProcess = getNodesFromLS().find((node) => node.id === nodeId);

  // If target node is not found, show an error message
  if (!nodeToProcess || !nodeToProcess.type) {
    sendExecutionComplete(false, sendCommand);
    return;
  }

  // Get next node id
  const nextNodeId =
    getEdgesFromLS().find((edge) => edge.source === nodeToProcess.id)?.target ??
    "nextNodeId";

  // Check the type of the target node and handle accordingly
  switch (nodeToProcess.type) {
    // case "triggerNode": - this will be processed by the "start" command and being handleed in useWebSocket hook
    case "plusNode": // Empty node, go to next node
    case "mergeBranchesNode": // Conditional or loop ends, go to next node
    case "branchStartNode": // Placeholder node, go to next node. We can remove this node later
    case "branchNode1": // Conditional branch node. Check condition. branch node id is passed which means condition is checked and its true so we'll start the branch processing
      sendNextNodeToProcess(sendCommand, nodeToProcess.id);
      return;
    case "activityNode": // Get activity node data -> Send the command to websocket
      sendCommand(
        "process-node",
        JSON.stringify(
          getActivityNodeData(nodeToProcess as Node<NodeDataType>, nextNodeId),
        ),
      );
      return;
    case "conditionalNode": // Save conditional mode (SwitchCase or nestedIfElse) in store and pick the branch node as per execution state
      processConditionalNode(
        nodeToProcess as Node<ConditionalNodeDataType>,
        false,
        sendCommand,
      );
      return;
    case "branchEndNode": {
      // Either Conditional or loop branch ends, so we need to process the conditional or loop node to move forward or end the group execution
      // Get branch parent node loop or conditional node
      const parentNode = getNodesFromLS().find(
        (node) => node.id === nodeToProcess?.data?.customParentId,
      );

      if (nodeToProcess.data.groupType === "CondtionalBranch") {
        processConditionalNode(
          parentNode as Node<ConditionalNodeDataType>,
          true,
          sendCommand,
        );
      } else if (nodeToProcess.data.groupType === "LoopBranch") {
        processLoopNode(parentNode as Node<LoopNodeDataType>, sendCommand);
      }
      return;
    }
    case "forLoopNode": // loop. Check condition
      // TODO: We need to change the name from "forLoopNode" to "LoopNode" only.
      processLoopNode(nodeToProcess as Node<LoopNodeDataType>, sendCommand);
      return;
    case "flowEndNode": // Execution is complete
      sendExecutionComplete(true, sendCommand);
      return;
    default: // If unknown node type, show an error message
      toast.error(
        `Unknown node type: ${nodeToProcess.type}. Please check the flow.`,
      );
      sendExecutionComplete(false, sendCommand);
      return;
  }
};

export { sendNodeToProcess, sendNextNodeToProcess };
