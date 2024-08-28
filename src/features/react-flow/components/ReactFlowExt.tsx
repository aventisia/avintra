import { CustomEdgeTypeObj } from "@/constants/custom-edge-type-obj";
import { CustomNodeTypeObj } from "@/constants/custom-node-type-obj";
import { defaultEdgeOptions } from "@/constants/default-edge-options";
import { useTrackSelection } from "@/hooks/useTrackSelection";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useConfirmDelete } from "../hooks/useConfirmDelete";
import { useFetchFlowToLoad } from "../hooks/useFetchFlowToLoad";
import { useOnNodeDelete } from "../hooks/useOnNodeDelete";
import { useUpdateFlowSilently } from "../hooks/useUpdateFlowSilently";
import "../remove-attribution.css";
import { BackgroundExt } from "./BackgroundExt";
import { ReactFlowContextMenu } from "./context-menu";
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
  const customNodeTypeObjMemo = useMemo(() => CustomNodeTypeObj, []);
  const customEdgesTypeObjMemo = useMemo(() => CustomEdgeTypeObj, []);

  // Track ReactFlow selection change
  useTrackSelection();

  // Fetch flow details and set document title
  useFetchFlowToLoad();

  // Save flow silently
  useUpdateFlowSilently();

  // Confirm delete handler
  const { onBeforeDelete } = useConfirmDelete();

  // Reconnect nodes if a middle node is deleted
  const { onNodesDelete } = useOnNodeDelete();

  // Render ReactFlow component
  return (
    <ReactFlowContextMenu>
      <ReactFlow
        fitView
        minZoom={0.4}
        defaultEdgeOptions={defaultEdgeOptions}
        nodeTypes={customNodeTypeObjMemo}
        edgeTypes={customEdgesTypeObjMemo}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onNodesDelete={onNodesDelete}
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
    </ReactFlowContextMenu>
  );
};
