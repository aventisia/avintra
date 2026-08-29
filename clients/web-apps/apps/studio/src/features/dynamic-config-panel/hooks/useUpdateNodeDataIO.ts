import { useReactFlow } from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";

import { broadcastNodeUpdate, useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { NodeInputType, NodeOutputType } from "@/types/node-data-type";

import { useDynamicConfigPanelStore } from "../stores/dcp-store";

/**
 * Hook to update a node's input/output data and flowVariablesObject in the ReactFlow store.
 */
export const useUpdateNodeDataIO = () => {
  const { updateNodeData } = useReactFlow();

  // Get ReactFlowExt store state & actions
  const { nodes, setNodes, flowVariablesObject, setFlowVariablesObject } = useReactFlowExtStore(
    useShallow((state) => ({
      nodes: state.nodes,
      setNodes: state.setNodes,
      flowVariablesObject: state.flowVariablesObject,
      setFlowVariablesObject: state.setFlowVariablesObject,
    })),
  );

  const { nodeData, setNodeData } = useDynamicConfigPanelStore(
    useShallow((state) => ({
      nodeData: state.nodeData,
      setNodeData: state.setNodeData,
    })),
  );

  /**
   * Update a node's input and output data by node id.
   * @param nodeId The id of the node to update.
   * @param newInputs New inputs array to set.
   * @param newOutputs New outputs array to set.
   */
  const updateNodeDataIO = (
    nodeId: string,
    newInputs: NodeInputType[],
    newOutputs: NodeOutputType[],
    nodeLabel?: string,
    selectedAgent?: { [key: string]: string }, // agent param
    selectedBlock?: { [key: string]: string }, // block param
    selectedModel?: { [key: string]: string }, // model param
  ) => {
    //  node by id and update its inputs and outputs

    // Set nodeData
    if (nodeData) {
      setNodeData({ ...nodeData, inputs: newInputs, outputs: newOutputs });
    }
    // Set valid node label
    const validNodeLabel = typeof nodeLabel === "string" && nodeLabel.length > 0 && nodeLabel;

    updateNodeData(nodeId, {
      inputs: newInputs,
      outputs: newOutputs,
      ...(validNodeLabel && { label: validNodeLabel }), //  node label
      ...(selectedAgent !== undefined && { selectedAgent }), //  agent add if defined
      ...(selectedBlock !== undefined && { selectedBlock }), //  block add if defined
      ...(selectedModel !== undefined && { selectedModel }), //  model add if defined
    });

    // Keep the ReactFlowExt store in sync (React Flow's updateNodeData bypasses the
    // store's onNodesChange path) and broadcast the change to collaborators in real time.
    const updatedNodes = nodes.map((node) =>
      node.id === nodeId
        ? {
            ...node,
            data: {
              ...node.data,
              inputs: newInputs,
              outputs: newOutputs,
              ...(validNodeLabel && { label: validNodeLabel }),
              ...(selectedAgent !== undefined && { selectedAgent }),
              ...(selectedBlock !== undefined && { selectedBlock }),
              ...(selectedModel !== undefined && { selectedModel }),
            },
          }
        : node,
    );
    setNodes(updatedNodes);
    broadcastNodeUpdate(nodeId);
  };

  /**
   * Update the flowVariablesObject in the store.
   * @param newVariables The new flow variables array.
   */
  const updateFlowVariablesObject = (nodeId: string, newOutputs: NodeOutputType[]) => {
    // Extract only the values from each output, ignoring the keys
    const filteredValues = newOutputs
      .filter((output: NodeOutputType) => output.value.enabled)
      .map((output: NodeOutputType) => output.value.value.toString());

    // Map through the existing flowVariablesObject to update the outputs
    let nodeExits = false;
    const updatedFlowVariablesObject = flowVariablesObject.map((item) => {
      if (item.nodeId === nodeId) {
        nodeExits = true;
        return {
          ...item,
          outputs: filteredValues,
        };
      }
      return item;
    });

    // If the node doesn't exist, add it to the flowVariablesObject
    if (!nodeExits) {
      updatedFlowVariablesObject.push({
        nodeId: nodeId,
        outputs: filteredValues,
      });
    }

    // Update the flowVariablesObject in the store
    setFlowVariablesObject(updatedFlowVariablesObject);
  };

  return {
    updateNodeDataIO,
    updateFlowVariablesObject,
  };
};
