import {
  BackgroundExt,
  MiniMapExt,
  useFetchFlowToLoad,
  ViewControls,
} from "@/features/react-flow";
import "@xyflow/react/dist/style.css";
import { ReactFlow } from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";
import { useReactFlowExtStore } from "@/stores";
import { useTrackSelection } from "@/hooks";
import { CustomNodeTypes } from "@/constants";

interface ReactFlowExtProps {
  children?: React.ReactNode;
}

/**
 * A custom extension of the ReactFlow component.
 */
export const ReactFlowExt = ({ children }: ReactFlowExtProps) => {
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

  // Track ReactFlow selection change
  useTrackSelection();

  // Fetch flow details and set document title
  useFetchFlowToLoad();

  // Render ReactFlow component
  return (
    <ReactFlow
      fitView
      nodeTypes={CustomNodeTypes}
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
    >
      {children}
      <ViewControls />
      <BackgroundExt />
      <MiniMapExt />
    </ReactFlow>
  );
};
