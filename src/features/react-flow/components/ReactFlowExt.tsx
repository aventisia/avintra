import { CustomNodeTypes } from "@/constants/CustomNodeTypes";
import { useTrackSelection } from "@/hooks/useTrackSelection";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import React, { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useFetchFlowToLoad } from "../hooks/useFetchFlowToLoad";
import { useUpdateFlowSilently } from "../hooks/useUpdateFlowSilently";
import { BackgroundExt } from "./BackgroundExt";
import { MiniMapExt } from "./MiniMapExt";
import { ViewControls } from "./view-controls";

/**
 * A custom extension of the ReactFlow component.
 */
export const ReactFlowExt = ({ children }: React.PropsWithChildren) => {
  // Get ReactFlowExt store state & actions
  const { nodes, edges, isLocked, onNodesChange, onEdgesChange, onConnect } =
    useReactFlowExtStore(
      useShallow((state) => ({
        nodes: state.nodes,
        edges: state.edges,
        isLocked: state.isLocked,
        onNodesChange: state.onNodesChange,
        onEdgesChange: state.onEdgesChange,
        onConnect: state.onConnect,
      })),
    );

  // Memoize the custom node types
  const customNodeTypesMemo = useMemo(() => CustomNodeTypes, []);

  // Track ReactFlow selection change
  useTrackSelection();

  // Fetch flow details and set document title
  useFetchFlowToLoad();

  // Save flow silently
  useUpdateFlowSilently();

  // Render ReactFlow component
  return (
    <ReactFlow
      fitView
      nodeTypes={customNodeTypesMemo}
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      //onNodesDelete={onNodesDelete}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      // Toggles Reactflows interactivity
      nodesDraggable={!isLocked}
      nodesConnectable={!isLocked}
      elementsSelectable={!isLocked}
      // Delete nodes key press
      deleteKeyCode={["Delete", "Backspace"]}
    >
      {children}
      <ViewControls />
      <BackgroundExt />
      <MiniMapExt />
    </ReactFlow>
  );
};
