import { CustomEdgeTypes } from "@/constants/custom-edge-types";
import { CustomNodeTypes } from "@/constants/custom-node-types";
import { DefaultEdgeOptions } from "@/constants/default-edge-options";
import { useTrackSelection } from "@/hooks/useTrackSelection";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useConfirmDelete } from "../hooks/useConfirmDelete";
import { useFetchFlowToLoad } from "../hooks/useFetchFlowToLoad";
import { useUpdateFlowSilently } from "../hooks/useUpdateFlowSilently";
import { BackgroundExt } from "./BackgroundExt";
import { FlowControls } from "./flow-controls";
import { MiniMapExt } from "./MiniMapExt";
import { ViewControls } from "./view-controls";

/**
 * A custom extension of the ReactFlow component.
 */
export const ReactFlowExt = () => {
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

  // Memoize the custom node, edges types
  const customNodeTypesMemo = useMemo(() => CustomNodeTypes, []);
  const customEdgesTypesMemo = useMemo(() => CustomEdgeTypes, []);

  // Track ReactFlow selection change
  useTrackSelection();

  // Fetch flow details and set document title
  useFetchFlowToLoad();

  // Save flow silently
  useUpdateFlowSilently();

  // Confirm delete handler
  const { onBeforeDelete } = useConfirmDelete();

  // Render ReactFlow component
  return (
    <ReactFlow
      fitView
      nodeTypes={customNodeTypesMemo}
      edgeTypes={customEdgesTypesMemo}
      defaultEdgeOptions={DefaultEdgeOptions}
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      //onNodesDelete={onNodesDelete}
      onEdgesChange={onEdgesChange}
      onBeforeDelete={() => onBeforeDelete({ nodes, edges })}
      onConnect={onConnect}
      deleteKeyCode={["Delete", "Backspace"]}
      // Toggles Reactflows interactivity
      nodesDraggable={!isLocked}
      nodesConnectable={!isLocked}
      elementsSelectable={!isLocked}
    >
      <FlowControls />
      <ViewControls />
      <BackgroundExt />
      <MiniMapExt />
    </ReactFlow>
  );
};
