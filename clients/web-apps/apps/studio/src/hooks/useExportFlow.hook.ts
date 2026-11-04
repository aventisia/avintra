import { buildFlowExportFileName } from "@avplatform/ui/utils";
import { Edge, Node } from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";

import { getPromptDataFromNodes } from "@/features/save-as-template/utils/getPromtDataFormNodes";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { NodeDataType } from "@/types/node-data-type";

import { useJsonDownload } from "./useJsonDownload.hook";

export const useExportFlow = () => {
  const { downloadJson } = useJsonDownload();

  const { currentFlow } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
    })),
  );

  const { nodes, edges, viewport, flowVariablesObject, inputOutputObject } = useReactFlowExtStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
      viewport: state.viewport,
      flowVariablesObject: state.flowVariablesObject,
      inputOutputObject: state.inputOutputObject,
    })),
  );

  const exportFlow = () => {
    const reactFlowObject = {
      nodes: nodes,
      edges: edges,
      viewport: viewport,
      flowVariablesObject,
      inputOutputObject,
    };

    downloadJson(
      { reactFlowObject },
      buildFlowExportFileName(currentFlow?.name, currentFlow?.versionNumber),
    );
  };

  const exportFlowTrimmed = () => {
    const trimmedNodes = getPromptDataFromNodes(nodes as Node<NodeDataType>[], true);
    const trimmedEdges = edges.map((edge: Edge) => {
      return { id: edge.id, source: edge.source, target: edge.target };
    });

    const reactFlowObject = {
      nodes: trimmedNodes,
      edges: trimmedEdges,
    };

    downloadJson(
      reactFlowObject,
      buildFlowExportFileName(currentFlow?.name, currentFlow?.versionNumber),
    );
  };

  return { exportFlow, exportFlowTrimmed };
};
