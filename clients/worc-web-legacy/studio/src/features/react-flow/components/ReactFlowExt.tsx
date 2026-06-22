import { LoadingSpinner } from "@aventisia/ui";
import {
  Edge,
  Node,
  OnSelectionChangeParams,
  ReactFlow,
  useOnViewportChange,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

import { CustomEdgeTypeObj } from "@/constants/custom-edge-type-obj";
import { CustomNodeTypeObj } from "@/constants/custom-node-type-obj";
import { defaultEdgeOptions } from "@/constants/default-edge-options";
import { useHistoryTracker } from "@/hooks/useHistoryTracker";
import { useTrackSelection } from "@/hooks/useTrackSelection";
import { useUndoRedoShortcuts } from "@/hooks/useUndoRedoShortcuts";
import { FlowTypesEnum } from "@/react-toolkit/enums/flow-types-enum";
import { AvPlatformAssistantUI } from "@/react-toolkit/features/av-platform-assistant-ui/components/AvPlatformAssistantUI";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/react-toolkit/ui/resizable";
import { useContextMenuActionsStore } from "@/stores/context-menu-actions-store";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

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
import { BackgroundExt } from "./BackgroundExt";
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

  // Memoize the custom node, edges types
  const customNodeTypeObjMemo = useMemo(() => CustomNodeTypeObj, []);
  const customEdgesTypeObjMemo = useMemo(() => CustomEdgeTypeObj, []);

  // Track ReactFlow selection change
  useTrackSelection();
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
  const { setSelectedNode, setSelectedEdge, setMenu } =
    useContextMenuActionsStore();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const { fitView } = useReactFlow();

  const recommendActions = useDefaultActions();

  // Re-fit view when the right chat panel opens/closes so the canvas re-centers
  // inside the newly sized container instead of staying offset.
  useEffect(() => {
    const timer = setTimeout(() => fitView({ duration: 200 }), 200);
    return () => clearTimeout(timer);
  }, [isTestChatOpen, fitView]);

  const calculateMenuPosition = (
    event: MouseEvent | React.MouseEvent<Element, MouseEvent>,
  ) => {
    const pane = reactFlowWrapper.current?.getBoundingClientRect();
    if (!pane) return null;

    return {
      top:
        event.clientY < pane.height - 300
          ? event.clientY - pane.top
          : undefined,
      left:
        event.clientX < pane.width - 250
          ? event.clientX - pane.left
          : undefined,
      right:
        event.clientX >= pane.width - 250
          ? pane.width - event.clientX + pane.left
          : undefined,
      bottom:
        event.clientY >= pane.height - 300
          ? pane.height - event.clientY + pane.top
          : undefined,
    };
  };

  useOnViewportChange({
    onChange: (viewport) => {
      setViewport(viewport);
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

  const handleSelectionChange = useCallback(
    ({ nodes }: OnSelectionChangeParams) => {
      setSelectedNode(nodes[0] || null);
    },
    [],
  );

  // Render ReactFlow component
  return (
    <ResizablePanelGroup orientation="horizontal" className="!bg-slate-200">
      <ResizablePanel minSize={"50%"}>
        <div ref={reactFlowWrapper} className="relative h-full w-full">
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
            <ViewControls />
            <BackgroundExt />
            <MiniMapExt />
          </ReactFlow>
          <ReactFlowContextMenu />
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
              defaultActions={
                recommendActions?.defaultActions
                  ? recommendActions?.defaultActions
                  : []
              }
            />
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
};
