import { buildFlowExportFileName } from "@avplatform/ui/utils";
import { useShallow } from "zustand/react/shallow";

import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

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

  return { exportFlow };
};
