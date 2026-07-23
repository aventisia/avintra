// import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
// import { NodeInputType, NodeOutputType } from "@/types/node-data-type";
// import { Node } from "@xyflow/react";
// import { useShallow } from "zustand/react/shallow";

// /**
//  * Hook to update a node's input/output data and flowVariablesObject in the ReactFlow store.
//  */
// export const useUpdateNodeDataIO = () => {
//   // Get ReactFlowExt store state & actions
//   const { nodes, flowVariablesObject, setNodes, setFlowVariablesObject } =
//     useReactFlowExtStore(
//       useShallow((state) => ({
//         nodes: state.nodes,
//         flowVariablesObject: state.flowVariablesObject,
//         setNodes: state.setNodes,
//         setFlowVariablesObject: state.setFlowVariablesObject,
//       })),
//     );

//   /**
//    * Update a node's input and output data by node id.
//    * @param nodeId The id of the node to update.
//    * @param newInputs New inputs array to set.
//    * @param newOutputs New outputs array to set.
//    */
//   const updateNodeDataIO = (
//     nodeId: string,
//     newInputs: NodeInputType[],
//     newOutputs: NodeOutputType[],
//     nodeLabel?: string,
//     selectedAgent?: { [key: string]: string }, // agent param
//     selectedBlock?: { [key: string]: string }, // block param
//     selectedModel?: { [key: string]: string }, // model param
//   ) => {
//     // Find the node by id and update its inputs and outputs
//     const updatedNodes = nodes.map((node: Node) => {
//       if (node.id === nodeId) {
//         // Set valid node label
//         const validNodeLabel =
//           typeof nodeLabel === "string" && nodeLabel.length > 0
//             ? nodeLabel
//             : node.data.label;

//         return {
//           ...node,
//           data: {
//             ...node.data,
//             label: validNodeLabel,
//             inputs: newInputs,
//             outputs: newOutputs,
//             ...(selectedAgent !== undefined && { selectedAgent }), //  agent add if defined
//             ...(selectedBlock !== undefined && { selectedBlock }), //  block add if defined
//             ...(selectedModel !== undefined && { selectedModel }), //  model add if defined
//           },
//         };
//       }
//       return node;
//     });

//     // Update the nodes in the store
//     setNodes(updatedNodes);
//   };

//   /**
//    * Update the flowVariablesObject in the store.
//    * @param newVariables The new flow variables array.
//    */
//   const updateFlowVariablesObject = (
//     nodeId: string,
//     newOutputs: NodeOutputType[],
//   ) => {
//     // Extract only the values from each output, ignoring the keys
//     const filteredValues = newOutputs
//       .filter((output: NodeOutputType) => output.value.enabled)
//       .map((output: NodeOutputType) => output.value.value.toString());

//     // Map through the existing flowVariablesObject to update the outputs
//     let nodeExits = false;
//     const updatedFlowVariablesObject = flowVariablesObject.map((item) => {
//       if (item.nodeId === nodeId) {
//         nodeExits = true;
//         return {
//           ...item,
//           outputs: filteredValues,
//         };
//       }
//       return item;
//     });

//     // If the node doesn't exist, add it to the flowVariablesObject
//     if (!nodeExits) {
//       updatedFlowVariablesObject.push({
//         nodeId: nodeId,
//         outputs: filteredValues,
//       });
//     }

//     // Update the flowVariablesObject in the store
//     setFlowVariablesObject(updatedFlowVariablesObject);
//   };

//   return {
//     updateNodeDataIO,
//     updateFlowVariablesObject,
//   };
// };
