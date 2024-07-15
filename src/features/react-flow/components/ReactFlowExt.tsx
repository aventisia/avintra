import "@xyflow/react/dist/style.css";
import { ReactFlow } from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";
import { useReactFlowExtStore } from "../stores/react-flow-ext-store";
import { BackgroundExt } from "./BackgroundExt";
import { MiniMapExt } from "./MiniMapExt";

interface ReactFlowExtProps {
  children?: React.ReactNode;
}

/**
 * A custom extension of the ReactFlow component.
 */
export const ReactFlowExt = ({ children }: ReactFlowExtProps) => {
  // Get ReactFlowExt store state & actions
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } =
    useReactFlowExtStore(
      useShallow((state) => ({
        nodes: state.nodes,
        edges: state.edges,
        onNodesChange: state.onNodesChange,
        onEdgesChange: state.onEdgesChange,
        onConnect: state.onConnect,
      })),
    );

  // Render ReactFlow component
  return (
    <ReactFlow
      fitView
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      //onNodesDelete={onNodesDelete}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
    >
      {children}
      <BackgroundExt />
      <MiniMapExt />
    </ReactFlow>
  );
};
