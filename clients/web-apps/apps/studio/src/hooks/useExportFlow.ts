// import { useViewport } from "@xyflow/react";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useShallow } from "zustand/react/shallow";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { useJsonDownload } from "./useJSONDowndloader";
import { Edge, Node } from "@xyflow/react";
import { NodeDataType } from "@/types/node-data-type";
import { getPromptDataFromNodes } from "@/features/save-as-template/utils/getPromtDataFormNodes";

// Hook for exporting flow data
export const useExportFlow = () => {
  const { downloadJson } = useJsonDownload();

  // Get global store state & actions
  const { currentFlow } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
    })),
  );

  // Get ReactFlowExt store state & actions
  const { nodes, edges, viewport, flowVariablesObject } = useReactFlowExtStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
      viewport: state.viewport,
      flowVariablesObject: state.flowVariablesObject,
    })),
  );

  const exportFlow = () => {
    // Create react flow object
    const reactFlowObject = {
      nodes: nodes,
      edges: edges,
      viewport: viewport,
    };

    const data = { reactFlowObject, flowVariablesObject };

    downloadJson(data, currentFlow?.name);
  };

  const exportFlowTrimmed = () => {
    const trimmedNodes = getPromptDataFromNodes(
      nodes as Node<NodeDataType>[],
      true,
    );
    const trimmedEdges = edges.map((edge: Edge) => {
      return { id: edge.id, source: edge.source, target: edge.target };
    });

    // Create react flow object
    const reactFlowObject = {
      nodes: trimmedNodes,
      edges: trimmedEdges,
    };

    downloadJson(reactFlowObject, currentFlow?.name);
  };

  return { exportFlow, exportFlowTrimmed };
};
