import { usePanelStore } from "@/components/panel/stores/panel-store";
import { CustomEdgeTypeObj } from "@/constants/custom-edge-type-obj";
import { CustomNodeTypeObj } from "@/constants/custom-node-type-obj";
import { defaultEdgeOptions } from "@/constants/default-edge-options";
import { DCPDialog } from "@/features/dynamic-config-panel";

import { LoadingSpinner } from "@aventisia/ui";
import { ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { PANEL_ID } from "../constants";
import { useReactFlowViewData } from "../hooks/useReactFlowViewData";
import { useReactFlowViewStore } from "../stores/react-flow-view-store";
import "../styles/override-edge-style.css";
import "../styles/override-node-style.css";
import "../styles/override-panel-style.css";
import "../styles/remove-attribution.css";
import { BackgroundViewOnly } from "./BackgroundViewOnly";
import { NodePopover } from "./FELInputOutput/NodePopover";
import { VersionHistoryPanel } from "./execution-log-panel/VersionHistoryPanel";
import { ViewControls } from "./view-controls";

/**
 * A read-only version of ReactFlow for viewing flows
 *
 */
export const ReactFlowViewOnly = () => {
  // Memoize the custom node and edge types
  const customNodeTypeObjMemo = useMemo(() => CustomNodeTypeObj, []);
  const customEdgesTypeObjMemo = useMemo(() => CustomEdgeTypeObj, []);

  const { nodes, edges } = useReactFlowViewStore(
    useShallow((state) => ({ nodes: state.nodes, edges: state.edges })),
  );

  const { isLoading } = useReactFlowViewData();

  const { openPanel, closePanel } = usePanelStore(
    useShallow((state) => ({
      openPanel: state.openPanel,
      closePanel: state.closePanel,
    })),
  );

  useEffect(() => {
    openPanel(PANEL_ID, "left");

    return () => {
      closePanel(PANEL_ID);
    };
  }, []);

  return (
    <>
      <VersionHistoryPanel />

      <div className="relative h-full ml-[21.5rem] w-[calc(100%-21.5rem)]">
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
        </ReactFlow>

        {isLoading && (
          <div className="bg-background/70 absolute inset-0 flex items-center justify-center backdrop-blur-sm">
            <LoadingSpinner className="h-6 w-6 text-primary" />
          </div>
        )}
      </div>
      <BackgroundViewOnly />
      <NodePopover />
      <DCPDialog />
    </>
  );
};
