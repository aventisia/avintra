import { CustomEdgeTypeObj } from "@/constants/custom-edge-type-obj";
import { CustomNodeTypeObj } from "@/constants/custom-node-type-obj";
import { defaultEdgeOptions } from "@/constants/default-edge-options";
import { DCPDialog } from "@/features/dynamic-config-panel";
import { useTrackSelection } from "@/hooks/useTrackSelection";
import { useContextMenuActionsStore } from "@/stores/context-menu-actions-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import {
  Edge,
  EdgeMouseHandler,
  Node,
  NodeMouseHandler,
  ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useConfirmDelete } from "../hooks/useConfirmDelete";
import { useFetchFlowToLoad } from "../hooks/useFetchFlowToLoad";
import { useOnNodeDelete } from "../hooks/useOnNodeDelete";
import { useUpdateFlowSilently } from "../hooks/useUpdateFlowSilently";
import "../styles/override-node-style.css";
import "../styles/override-panel-style.css";
import "../styles/remove-attribution.css";
import { BackgroundExt } from "./BackgroundExt";
import { MiniMapExt } from "./MiniMapExt";
import { ViewControls } from "./view-controls";
import ExecutionLogDialog from "@/features/flow-execution-log/components";
import SearchCommandDialog from "@/features/search/componets";
import { FlowSettings } from "@/features/flow-settings/components";
import AddInputsOutputsDialog from "@/features/add-input-output/components/AddInputsOutputsDialog";
import { FlowBlockCrudDialog } from "@/features/flow-block/components/flow-block-crud-dialog";
import ShareAccessDialog from "@/features/share-access/components";

/**
 * A custom extension of the ReactFlow component.
 */
export const ReactFlowExt = () => {
  // Get ReactFlowExt store state & actions
  const {
    nodes,
    edges,
    panOnDrag,
    // isPublished,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useReactFlowExtStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
      panOnDrag: state.panOnDrag,
      onNodesChange: state.onNodesChange,
      onEdgesChange: state.onEdgesChange,
      onConnect: state.onConnect,
      isPublished: state.isPublished,
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

  // Setter functions for context menu node
  const { setSelectedNode, setSelectedEdge } = useContextMenuActionsStore();

  // Define onNodeContextMenu handler
  const onNodeContextMenu: NodeMouseHandler = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
    },
    [setSelectedNode],
  );

  // Define onEdgeContextMenu handler
  const onEdgeContextMenu: EdgeMouseHandler = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      setSelectedEdge(edge);
    },
    [setSelectedEdge],
  );

  // Render ReactFlow component
  return (
    <DCPDialog>
      <ReactFlow
        fitView
        minZoom={0.4}
        panOnDrag={panOnDrag}
        panOnScroll
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
        deleteKeyCode={"Delete"}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        // TODO: Toggles Reactflows interactivity - we can use this to lock the flow
        // nodesDraggable={!isLocked}
        // nodesConnectable={!isLocked}
        // elementsSelectable={!isLocked}
      >
        <ViewControls />
        <BackgroundExt />
        <MiniMapExt />
      </ReactFlow>
      <ExecutionLogDialog />
      <SearchCommandDialog />
      <ShareAccessDialog />
      <AddInputsOutputsDialog />
      <FlowSettings />
      <FlowBlockCrudDialog />
    </DCPDialog>
  );
};
