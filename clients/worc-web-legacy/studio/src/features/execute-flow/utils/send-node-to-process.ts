import { toast } from "@aventisia/ui/sonner";
import { Edge, Node } from "@xyflow/react";
import { get } from "idb-keyval";

import { ConditionalNodeDataType } from "@/types/conditional-node-data-type";
import { LoopNodeDataType } from "@/types/loop-node-data-type";
import { NodeDataType } from "@/types/node-data-type";

import {
  ConditionalNodeData,
  LoopNodeData,
  WebSocketCommandType,
  getActivityNodeData,
  getCloudConnectorNodeData,
  getConditionNodeData,
  getConditionalBranchNodeData,
  getLoopNodeData,
  getWpfLoopNodeData,
} from "..";
import { SUB_FLOW_GRAPH_DB_KEY, SubFlowGraph } from "../hooks/useFetchSubFlows";

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

  // If currentNodeId is not provided, then execution has just started, then send the trigger node to process
  if (!currentNodeId) {
    const triggerNode = getNodesFromLS().find(
      (node) => node.type === "triggerNode",
    );

    // Send node to process
    sendNodeToProcess(triggerNode?.id || "nodeId", sendCommand);

    // Initial execution should only dispatch the trigger node.
    // The next node is dispatched after executor sends "next-node".
    return;
  }

  // Find node edge -> then get target node id
  const targetNodeId = getEdgesFromLS().find(
    (edge) =>
      edge.source === currentNodeId &&
      (edge.sourceHandle === undefined ||
        edge.sourceHandle !== "branch-return") &&
      edge.type != "loopBack",
  )?.target;

  // Send node to process
  sendNodeToProcess(targetNodeId || "nodeId", sendCommand);
};

// Send execution complete command
const sendExecutionComplete = (
  command: WebSocketCommandType,
  sendCommand: (command: WebSocketCommandType, data?: string) => void,
  data?: string,
) => {
  // Remove the items from local storage
  if (command === "complete" || command === "error" || command === "abort") {
    // Clean up execution state to prevent stale data from affecting the next run
    localStorage.removeItem("flowExecutionStack");
    localStorage.removeItem("conditionalExecutionGroup");
    localStorage.removeItem("loopExecutionGroup");
    sendCommand(command, data);
  }

  // Show a message to the user
  switch (command) {
    case "complete":
      toast.success("Execution completed successfully.");
      break;
    case "pause":
      // TODO: need to handle pause and resume logic
      toast.info("Execution paused");
      break;
    case "error":
      toast.error(
        "Execution failed. Please check the execution logs for details.",
      );
      try {
        const parsedData = data ? JSON.parse(data) : {};
        console.error("Execution failed", parsedData);
      } catch {
        console.error("Execution failed", data);
      }
      break;
    case "abort":
      toast.warning("Execution has been aborted");
      break;
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
    getEdgesFromLS().find(
      (edge) => edge.source === branchNode?.id && edge.type != "loopBack",
    )?.target ?? "nextNodeId";

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
    getEdgesFromLS().find(
      (edge) => edge.source === node.id && edge.type != "loopBack",
    )?.target ?? "nextNodeId";

  // Send loop node to check condition
  sendCommand(
    "check-loop-condition",
    JSON.stringify(getWpfLoopNodeData(node, nextNodeId)),
  );
};

async function executeSubflow(
  node: Node,
  sendCommand: (command: WebSocketCommandType, data?: string) => void,
  isBlock: boolean = false,
) {
  const subFlowObj = (
    isBlock ? node.data?.selectedBlock : node.data?.selectedAgent
  ) as { [key: string]: string };

  if (!subFlowObj?.flowId || !subFlowObj?.id) {
    toast.error("Subflow data is missing.");
    return sendCommand("error");
  }

  const returnNodeId = getEdgesFromLS().find(
    (e) => e.source === node.id && e.type != "loopBack",
  )?.target;

  try {
    const subFlowGraphs =
      (await get<SubFlowGraph[]>(SUB_FLOW_GRAPH_DB_KEY)) || [];
    const subFlowGraph = subFlowGraphs.find(
      (item) => item.subFlowId === subFlowObj.id,
    );

    if (!subFlowGraph) {
      toast.error("Subflow data not found in local cache.");
      return sendCommand("error");
    }

    const subFlowNodes = subFlowGraph.nodes;
    const subFlowEdges = subFlowGraph.edges;

    // Replace the sub flow trigger inputs with the inputs from the sub flow node
    const updatedSubFlowNodes = subFlowNodes.map((subFlowNode) => {
      if (subFlowNode.type === "triggerNode") {
        return {
          ...subFlowNode,
          data: {
            ...subFlowNode.data,
            label: `Starting ${node.data?.label || "Subflow"}...`,
            inputs: node.data?.inputs || [],
          },
        };
      }
      return subFlowNode;
    });

    // Push current execution context to stack
    const executionStack = JSON.parse(
      localStorage.getItem("flowExecutionStack") || "[]",
    );

    executionStack.push({
      nodes: getNodesFromLS(),
      edges: getEdgesFromLS(),
      conditionalExecutionGroup: getConditionalExecutionGroupFromLS(),
      loopExecutionGroup: getLoopExecutionGroupFromLS(),
      returnNodeId: returnNodeId ?? "",
    });

    localStorage.setItem("flowExecutionStack", JSON.stringify(executionStack));

    // Load subflow context
    localStorage.setItem("nodes", JSON.stringify(updatedSubFlowNodes));
    localStorage.setItem("edges", JSON.stringify(subFlowEdges));
    localStorage.setItem("conditionalExecutionGroup", JSON.stringify([]));
    localStorage.setItem("loopExecutionGroup", JSON.stringify([]));

    // Start subflow
    sendNextNodeToProcess(sendCommand);
  } catch (error) {
    toast.error("Failed to execute sub-flow: " + error);
    sendCommand("error");
  }
}

// Function to find the node and send its data
const sendNodeToProcess = async (
  nodeId: string,
  sendCommand: (command: WebSocketCommandType, data?: string) => void,
) => {
  // Get node first
  const nodeToProcess = getNodesFromLS().find((node) => node.id === nodeId);

  // If target node is not found, show an error message
  if (!nodeToProcess || !nodeToProcess.type) {
    console.error(
      "Node not found or invalid node type",
      nodeId,
      nodeToProcess,
      "Current nodes in localStorage:",
      getNodesFromLS().map((n) => ({ id: n.id, type: n.type })),
    );
    sendExecutionComplete(
      "error",
      sendCommand,
      `Node not found or invalid node type ${nodeId} ${nodeToProcess?.type}`,
    );
    return;
  }

  // If node is disabled, skip it and move to the next node
  if (nodeToProcess.data?.isDisabled) {
    const nextNodeId = getEdgesFromLS().find(
      (edge) => edge.source === nodeToProcess.id && edge.type != "loopBack",
    )?.target;

    if (nextNodeId) {
      await sendNodeToProcess(nextNodeId, sendCommand); // Recursively call to process the next node
    }
    return; //this stops the *current* function frame from continuing
  }

  // Get next node id
  const nextNodeId =
    getEdgesFromLS().find(
      (edge) => edge.source === nodeToProcess.id && edge.type != "loopBack",
    )?.target ?? "nextNodeId";

  // Check the type of the target node and handle accordingly
  switch (nodeToProcess.type) {
    case "triggerNode":
      sendCommand(
        "setup-execution-context",
        JSON.stringify(
          getActivityNodeData(nodeToProcess as Node<NodeDataType>, nextNodeId),
        ),
      );
      return;
    case "plusNode": // Empty node, go to next node
    case "mergeBranchesNode": // Conditional or loop ends, go to next node
    case "branchStartNode": // Placeholder node, go to next node. We can remove this node later
    case "branchNode1": // Conditional branch node. Check condition. branch node id is passed which means condition is checked and its true so we'll start the branch processing
      sendNextNodeToProcess(sendCommand, nodeToProcess.id);
      return;
    case "activityNode": // Get activity node data -> Send the command to websocket
    case "aiNode": // Get ai node data -> Send the command to websocket
      sendCommand(
        "process-node",
        JSON.stringify(
          getActivityNodeData(nodeToProcess as Node<NodeDataType>, nextNodeId),
        ),
      );
      return;
    case "cloudConnectorNode": // Get cloud connector node data -> Send the command to websocket
      sendCommand(
        "process-node",
        JSON.stringify(
          getCloudConnectorNodeData(
            nodeToProcess as Node<NodeDataType>,
            nextNodeId,
          ),
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
    case "flowEndNode": {
      //Execution is complete
      const executionStack = JSON.parse(
        localStorage.getItem("flowExecutionStack") || "[]",
      );

      if (executionStack.length > 0) {
        const {
          nodes,
          edges,
          conditionalExecutionGroup,
          loopExecutionGroup,
          returnNodeId,
        } = executionStack.pop();

        localStorage.setItem(
          "flowExecutionStack",
          JSON.stringify(executionStack),
        );
        localStorage.setItem("nodes", JSON.stringify(nodes));
        localStorage.setItem("edges", JSON.stringify(edges));
        localStorage.setItem(
          "conditionalExecutionGroup",
          JSON.stringify(conditionalExecutionGroup),
        );
        localStorage.setItem(
          "loopExecutionGroup",
          JSON.stringify(loopExecutionGroup),
        );

        sendNodeToProcess(returnNodeId, sendCommand);
      } else {
        sendExecutionComplete("complete", sendCommand);
      }
      return;
    }

    case "callAgentNode": {
      await executeSubflow(nodeToProcess, sendCommand);
      return;
    }

    case "blockNode": {
      await executeSubflow(nodeToProcess, sendCommand, true);
      return;
    }
    default: // If unknown node type, show an error message
      toast.error(
        `Unknown node type: ${nodeToProcess.type}. Please check the flow.`,
      );
      sendExecutionComplete(
        "error",
        sendCommand,
        `Unknown node type: ${nodeToProcess.type}`,
      );
      return;
  }
};

export { sendExecutionComplete, sendNextNodeToProcess, sendNodeToProcess };
