import { LoadingSpinner } from "@avplatform/ui";
import { cn } from "@avplatform/ui/lib";
import { ReactFlow, useReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

import { usePanelStore } from "@/components/panel/stores/panel-store";
import { PANEL_TRANSITION_DURATION, ZOOM_ANIMATION_DURATION } from "@/constants";
import { ReadOnlyEdgeTypeObj } from "@/constants/custom-edge-type-obj";
import { CustomNodeTypeObj } from "@/constants/custom-node-type-obj";
import { defaultEdgeOptions } from "@/constants/default-edge-options";
import { FlowBreadcrumbs } from "@/features/react-flow/components/FlowBreadcrumbs";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

import { NODE_DETAIL_PANEL_ID, PANEL_ID } from "../constants";
import { useReactFlowViewData } from "../hooks/useReactFlowViewData";
import { useNodeDetailStore } from "../stores/node-detail-store";
import "../styles/override-panel-style.css";
import "../styles/remove-attribution.css";
import { BackgroundViewOnly } from "./BackgroundViewOnly";
import { NodeDetailPanel } from "./NodeDetailPanel";
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

  const { openPanel, closePanel, isNodeDetailPanelOpen } = usePanelStore(
    useShallow((state) => ({
      openPanel: state.openPanel,
      closePanel: state.closePanel,
      isNodeDetailPanelOpen: state.panels[NODE_DETAIL_PANEL_ID]?.isOpen ?? false,
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

  // Opening the node detail panel narrows the canvas, so the node whose log was opened is
  // brought to the centre of the remaining space (the user immediately sees the node they are
  // inspecting). Closing needs no viewport change — the graph stays where the user left it.
  const { getNode, setCenter } = useReactFlow();
  const { selectedNodeId } = useNodeDetailStore(
    useShallow((state) => ({ selectedNodeId: state.selectedNodeId })),
  );
  const wasPanelOpenRef = useRef(false);

  // Smoothly bring a node to the centre of the canvas at 100% zoom (matching the fit zoom).
  const centerNode = useCallback(
    (nodeId: string) => {
      const node = getNode(nodeId);
      if (!node) return;

      const width = node.measured?.width ?? 0;
      const height = node.measured?.height ?? 0;

      setCenter(node.position.x + width / 2, node.position.y + height / 2, {
        zoom: 1,
        duration: ZOOM_ANIMATION_DURATION,
      });
    },
    [getNode, setCenter],
  );

  useEffect(() => {
    const justOpened = isNodeDetailPanelOpen && !wasPanelOpenRef.current;
    wasPanelOpenRef.current = isNodeDetailPanelOpen;

    if (!isNodeDetailPanelOpen || !selectedNodeId) return;

    // Opening slides the panel in, so wait for the transition to finish before touching the
    // viewport. Switching nodes while the panel is already open needs no wait.
    const timeout = setTimeout(
      () => centerNode(selectedNodeId),
      justOpened ? PANEL_TRANSITION_DURATION : 0,
    );

    return () => clearTimeout(timeout);
  }, [isNodeDetailPanelOpen, selectedNodeId, centerNode]);

  return (
    <>
      <ExecutionLogPanel isSubFlowView={isSubFlowView} />

      <div
        className={cn(
          "relative ml-[21.5rem] h-full w-[calc(100%-21.5rem)]",
          isNodeDetailPanelOpen && "mr-[30.5rem] w-[calc(100%-21.5rem-30.5rem)]",
        )}
      >
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
      <NodeDetailPanel />
    </>
  );
};
