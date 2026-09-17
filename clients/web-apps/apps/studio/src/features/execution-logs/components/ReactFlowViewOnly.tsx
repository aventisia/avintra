import { LoadingSpinner } from "@avplatform/ui";
import { ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { usePanelStore } from "@/components/panel/stores/panel-store";
import { ReadOnlyEdgeTypeObj } from "@/constants/custom-edge-type-obj";
import { CustomNodeTypeObj } from "@/constants/custom-node-type-obj";
import { defaultEdgeOptions } from "@/constants/default-edge-options";
import { FlowBreadcrumbs } from "@/features/react-flow/components/FlowBreadcrumbs";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

import { PANEL_ID } from "../constants";
import { useReactFlowViewData } from "../hooks/useReactFlowViewData";
import "../styles/override-panel-style.css";
import "../styles/remove-attribution.css";
import { BackgroundViewOnly } from "./BackgroundViewOnly";
import { NodePopover } from "./FELInputOutput/NodePopover";
import { ExecutionLogPanel } from "./execution-log-panel/ExecutionLogPanel";
import { ViewControls } from "./view-controls";

/**
 * A read-only version of ReactFlow for viewing flows
 *
 */
export const ReactFlowViewOnly = () => {
  // Memoize the custom node and edge types
  const customNodeTypeObjMemo = useMemo(() => CustomNodeTypeObj, []);
  const customEdgesTypeObjMemo = useMemo(() => ReadOnlyEdgeTypeObj, []);

  const { nodes, edges } = useReactFlowExtStore(
    useShallow((state) => ({ nodes: state.nodes, edges: state.edges })),
  );

  const { isPending, isLoading, isFetching, isSubFlowView } = useReactFlowViewData();

  const { openPanel, closePanel } = usePanelStore(
    useShallow((state) => ({
      openPanel: state.openPanel,
      closePanel: state.closePanel,
    })),
  );

  // The execution list is only meaningful for the root flow of a run. Inside a sub-flow the
  // job cannot change (the sub-flow's logs are part of the selected job), so the list is
  // replaced with an explanatory message instead of letting the user pick another job.
  // Returning to the root flow via the breadcrumb restores the list.
  useEffect(() => {
    openPanel(PANEL_ID, "left");

    return () => {
      closePanel(PANEL_ID);
    };
  }, []);

  return (
    <>
      <ExecutionLogPanel isSubFlowView={isSubFlowView} />

      <div className="relative h-full ml-[21.5rem] w-[calc(100%-21.5rem)]">
        {isPending || isLoading || isFetching ? (
          <div className="bg-background/70 absolute inset-0 flex items-center justify-center backdrop-blur-sm">
            <LoadingSpinner className="h-6 w-6 text-primary" />
          </div>
        ) : (
          <ReactFlow
            fitView
            minZoom={0.1}
            maxZoom={2}
            // Enable panning and zooming for navigation
            panOnDrag={true}
            panOnScroll={true}
            zoomOnScroll={true}
            zoomOnPinch={true}
            zoomOnDoubleClick={true}
            // Disable all editing interactions
            nodesDraggable={false}
            nodesConnectable={false}
            nodesFocusable={false}
            edgesFocusable={false}
            elementsSelectable={false}
            // Disable deletion
            deleteKeyCode={null}
            // Provide data
            nodes={nodes}
            edges={edges}
            nodeTypes={customNodeTypeObjMemo}
            edgeTypes={customEdgesTypeObjMemo}
            defaultEdgeOptions={defaultEdgeOptions}
            // Snap to grid for consistent rendering
            snapToGrid={true}
            snapGrid={[16, 16]}
            // No change handlers - read-only
            onNodesChange={undefined}
            onEdgesChange={undefined}
            onConnect={undefined}
          >
            {/* Keep navigation controls */}
            <ViewControls />
            {/* Breadcrumb trail so the user can navigate back out of a sub-flow */}
            <FlowBreadcrumbs />
          </ReactFlow>
        )}
      </div>
      <BackgroundViewOnly />
      <NodePopover />
    </>
  );
};
