import { LoadingSpinner } from "@avplatform/ui";
import { FlowTypesEnum } from "@avplatform/ui/enums";
import { useQueryClient } from "@tanstack/react-query";
import { Edge, Node, OnSelectionChangeParams, ReactFlow, useOnViewportChange } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useMemo, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

import { CustomEdgeTypeObj } from "@/constants/custom-edge-type-obj";
import { CustomNodeTypeObj } from "@/constants/custom-node-type-obj";
import { defaultEdgeOptions } from "@/constants/default-edge-options";
import { AC_QUERY_KEY } from "@/features/available-credits/available-credits-constants";
import { CanvasNodeDetailPanel } from "@/features/execute-flow/components/CanvasNodeDetailPanel";
import { ClearRunResultsPanel } from "@/features/execute-flow/components/ClearRunResultsPanel";
import { useHistoryTracker } from "@/hooks/useHistoryTracker";
import { useUndoRedoShortcuts } from "@/hooks/useUndoRedoShortcuts";
import { AvPlatformAssistantUI } from "@/react-toolkit/features/av-platform-assistant-ui/components/AvPlatformAssistantUI";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/react-toolkit/ui/resizable";
import { useContextMenuActionsStore } from "@/stores/context-menu-actions-store";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { useTrackSelectionStore } from "@/stores/track-selection-store";

import { useConfirmDelete } from "../hooks/useConfirmDelete";
import { useCopyPasteShortcuts } from "../hooks/useCopyPasteShortcuts";
import { useDefaultActions } from "../hooks/useDefaultActions";
import { useFetchConfigKeys } from "../hooks/useFetchConfigKeys";
import { useFetchFlowToLoad } from "../hooks/useFetchFlowToLoad";
import { useOnNodeDelete } from "../hooks/useOnNodeDelete";
import "../styles/override-edge-style.css";
import "../styles/override-node-style.css";
import "../styles/override-panel-style.css";
import "../styles/remove-attribution.css";
import { saveViewport } from "../utils/viewport-persistence";
import { AutoFollowExecutingNode } from "./AutoFollowExecutingNode";
import { BackgroundExt } from "./BackgroundExt";
import { FlowBreadcrumbs } from "./FlowBreadcrumbs";
import { MiniMapExt } from "./MiniMapExt";
import { ReactFlowDialogWrapper } from "./ReactFlowDialogWrapper";
import { TestChatAgent } from "./TestChatAgent";
import { ReactFlowContextMenu } from "./context-menu";
import { ViewControls } from "./view-controls";

/**
 * A custom extension of the ReactFlow component.
 */
export const ReactFlowExt = () => {
  // Get ReactFlowExt store state & actions
  const {
    nodes,
    edges,
    panOnDrag,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setViewport,
    flowType,
    isTestChatOpen,
  } = useReactFlowExtStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
      panOnDrag: state.panOnDrag,
      onNodesChange: state.onNodesChange,
      onEdgesChange: state.onEdgesChange,
      onConnect: state.onConnect,
      setViewport: state.setViewport,
      flowType: state.flowType,
      isTestChatOpen: state.isTestChatOpen,
    })),
  );

  // Get global store state and actions
  const { currentFlow } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
    })),
  );

  const queryClient = useQueryClient();

  // Chat Agent streaming consumes credits per message; refresh the header
  // balance the moment a chat request completes so it updates without reload.
  const handleChatRequestComplete = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: AC_QUERY_KEY });
  }, [queryClient]);

  // Memoize the custom node, edges types
  const customNodeTypeObjMemo = useMemo(() => CustomNodeTypeObj, []);
  const customEdgesTypeObjMemo = useMemo(() => CustomEdgeTypeObj, []);

  useCopyPasteShortcuts();

  useHistoryTracker(); // Initialize background  tracking
  useUndoRedoShortcuts(); // Initialize keyboard shortcuts

  // Fetch flow details and set document title
  const { isLoading } = useFetchFlowToLoad();

  useFetchConfigKeys();

  // Confirm delete handler
  const { onBeforeDelete } = useConfirmDelete();

  // Reconnect nodes if a middle node is deleted
  const { onNodesDelete } = useOnNodeDelete();

  // Setter functions for context menu node
  const { setSelectedNode, setSelectedEdge, setMenu } = useContextMenuActionsStore();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const recommendActions = useDefaultActions();

  const calculateMenuPosition = (event: MouseEvent | React.MouseEvent<Element, MouseEvent>) => {
    const pane = reactFlowWrapper.current?.getBoundingClientRect();
    if (!pane) return null;

    return {
      top: event.clientY < pane.height - 300 ? event.clientY - pane.top : undefined,
      left: event.clientX < pane.width - 250 ? event.clientX - pane.left : undefined,
      right: event.clientX >= pane.width - 250 ? pane.width - event.clientX + pane.left : undefined,
      bottom:
        event.clientY >= pane.height - 300 ? pane.height - event.clientY + pane.top : undefined,
    };
  };

  // Persist the user's viewport (position + zoom) to localStorage for the current flow
  // version whenever they pan/zoom, so it can be restored on refresh and parent/sub-flow
  // navigation instead of re-centering the canvas each time.
  useOnViewportChange({
    onChange: (viewport) => {
      setViewport(viewport);
      saveViewport(currentFlow.versionId, viewport);
    },
  });

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      const position = calculateMenuPosition(event);
      if (!position) return;

      setSelectedNode(node);
      setSelectedEdge(null);
      setMenu(position);

      if (import.meta.env.MODE !== "production") console.log("NODE:", node);
    },
    [setSelectedNode, setSelectedEdge, setMenu],
  );

  // Define onEdgeContextMenu handler
  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();
      const position = calculateMenuPosition(event);
      if (!position) return;

      setSelectedEdge(edge);
      setSelectedNode(null);
      setMenu(position);

      if (import.meta.env.MODE !== "production") console.log("EDGE:", edge);
    },
    [setSelectedNode, setSelectedEdge, setMenu],
  );

  const onPaneContextMenu = useCallback(
    (event: MouseEvent | React.MouseEvent<Element, MouseEvent>) => {
      event.preventDefault();
      const position = calculateMenuPosition(event);
      if (!position) return;

      setSelectedNode(null);
      setSelectedEdge(null);
      setMenu(position);
    },
    [setSelectedNode, setSelectedEdge, setMenu],
  );

  const onPaneClick = useCallback(() => {
    setMenu(null);
  }, [setMenu]);

  const { setSelectedNodes, setMultipleNodesSelected } = useTrackSelectionStore(
    useShallow((state) => ({
      setSelectedNodes: state.setSelectedNodes,
      setMultipleNodesSelected: state.setMultipleNodesSelected,
    })),
  );

  const handleSelectionChange = useCallback(
    ({ nodes }: OnSelectionChangeParams) => {
      setSelectedNode(nodes[0] || null);
      setSelectedNodes(nodes);
      setMultipleNodesSelected(nodes.length > 1);
    },
    [setSelectedNode, setSelectedNodes, setMultipleNodesSelected],
  );

  // Render ReactFlow component
  return (
    <ResizablePanelGroup orientation="horizontal" className="!bg-slate-200">
      <ResizablePanel minSize={"50%"}>
        <div ref={reactFlowWrapper} className="relative h-full w-full">
          <FlowBreadcrumbs />
          <ReactFlow
            fitView
            minZoom={0.1}
            panOnDrag={panOnDrag}
            panOnScroll
            defaultEdgeOptions={defaultEdgeOptions}
            nodeTypes={customNodeTypeObjMemo}
            edgeTypes={customEdgesTypeObjMemo}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onNodesDelete={onNodesDelete}
            onSelectionChange={handleSelectionChange}
            onEdgesChange={onEdgesChange}
            onBeforeDelete={() => onBeforeDelete({ nodes, edges })}
            onConnect={onConnect}
            deleteKeyCode={"Delete"}
            onNodeContextMenu={onNodeContextMenu}
            onEdgeContextMenu={onEdgeContextMenu}
            onPaneContextMenu={onPaneContextMenu}
            onPaneClick={onPaneClick}
            // onlyRenderVisibleElements
            snapToGrid={true}
            snapGrid={[16, 16]}
          >
            {flowType === FlowTypesEnum.ChatAgent && <TestChatAgent />}
            <AutoFollowExecutingNode />
            <ViewControls />
            <ClearRunResultsPanel />
            <BackgroundExt />
            <MiniMapExt />
          </ReactFlow>
          <ReactFlowContextMenu />
          <CanvasNodeDetailPanel />
          {isLoading && (
            <div className="absolute inset-0 -top-16 flex items-center justify-center  backdrop-blur-sm">
              <LoadingSpinner className="h-6 w-6 text-primary" />
            </div>
          )}
        </div>

        <ReactFlowDialogWrapper />
      </ResizablePanel>
      {flowType === FlowTypesEnum.ChatAgent && isTestChatOpen && (
        <>
          <ResizableHandle withHandle className="bg-slate-300" />
          <ResizablePanel minSize={"30%"} defaultSize="35%">
            <AvPlatformAssistantUI
              flowVersionId={currentFlow.versionId}
              mode="temporary"
              onRequestComplete={handleChatRequestComplete}
              defaultActions={
                recommendActions?.defaultActions ? recommendActions?.defaultActions : []
              }
            />
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
};
