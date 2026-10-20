import { LoadingSpinner } from "@avplatform/ui";
import { FlowTypesEnum } from "@avplatform/ui/enums";
import { useQueryClient } from "@tanstack/react-query";
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
import { AC_QUERY_KEY } from "@/features/available-credits/available-credits-constants.ee";
import { FlowActionLockBanner } from "@/features/collaboration/components/FlowActionLockBanner";
import { RemoteCursors } from "@/features/collaboration/components/RemoteCursors";
import { LockTargetType } from "@/features/collaboration/dtos/collaboration-dtos";
import {
  broadcastCursorEvent,
  useCollaboration,
} from "@/features/collaboration/hooks/useCollaboration";
import { DCPDialog } from "@/features/dynamic-config-panel";
import { useDynamicConfigPanelStore } from "@/features/dynamic-config-panel/stores/dcp-store";
import { CanvasNodeDetailPanel } from "@/features/execute-flow/components/CanvasNodeDetailPanel";
import { ClearRunResultsPanel } from "@/features/execute-flow/components/ClearRunResultsPanel";
import { useLiveExecutionStore } from "@/features/execute-flow/stores/live-execution-store";
import { useHistoryTracker } from "@/hooks/useHistoryTracker";
import { useUndoRedoShortcuts } from "@/hooks/useUndoRedoShortcuts";
import { AvPlatformAssistantUI } from "@/react-toolkit/features/av-platform-assistant-ui/components/AvPlatformAssistantUI";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/react-toolkit/ui/resizable";
import { useContextMenuActionsStore } from "@/stores/context-menu-actions-store";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { setCollaborationBroadcasters, useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { useTrackSelectionStore } from "@/stores/track-selection-store";

import { useConfirmDelete } from "../hooks/useConfirmDelete";
import { useCopyPasteShortcuts } from "../hooks/useCopyPasteShortcuts";
import { useDefaultActions } from "../hooks/useDefaultActions";
import { useFetchConfigKeys } from "../hooks/useFetchConfigKeys";
import { useFetchFlowToLoad } from "../hooks/useFetchFlowToLoad";
import { useOnNodeDelete } from "../hooks/useOnNodeDelete";
import { useVoiceIntroduction } from "../hooks/useVoiceIntroduction.hook";
import "../styles/override-edge-style.css";
import "../styles/override-node-style.css";
import "../styles/override-panel-style.css";
import "../styles/remove-attribution.css";
import { isSingleNodeAgentFlow } from "../utils/single-node-agent-flow.util";
import { saveViewport } from "../utils/viewport-persistence";
import { AutoFollowExecutingNode } from "./AutoFollowExecutingNode";
import { BackgroundExt } from "./BackgroundExt";
import { FlowBreadcrumbs } from "./FlowBreadcrumbs";
import { MiniMapExt } from "./MiniMapExt";
import { ReactFlowDialogWrapper } from "./ReactFlowDialogWrapper";
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
    })),
  );

  // Get global store state and actions
  const { currentFlow, isVersionTransitioning } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
      isVersionTransitioning: state.isVersionTransitioning,
    })),
  );

  const queryClient = useQueryClient();

  // Chat Agent streaming consumes credits per message; refresh the header
  // balance the moment a chat request completes so it updates without reload.
  const handleChatRequestComplete = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: AC_QUERY_KEY });
  }, [queryClient]);

  // Model label for the always-visible single-node agent test panel, read from the
  // AI node's model config so the tester knows what is being exercised.
  const chatModelLabel = useMemo(() => {
    if (flowType !== FlowTypesEnum.ChatAgent && flowType !== FlowTypesEnum.VoiceAgent)
      return undefined;
    const aiNode = nodes.find((node) => node.type === "aiNode");
    const inputs = (
      aiNode?.data as { inputs?: Array<{ key?: string; value?: unknown }> } | undefined
    )?.inputs;
    const modelKey =
      flowType === FlowTypesEnum.VoiceAgent
        ? "__ModelConfig__Voice"
        : "__ModelConfig__Conversation";
    const modelConfig = inputs?.find((input) => input.key === modelKey)?.value as
      { model?: unknown } | undefined;
    return typeof modelConfig?.model === "string" ? modelConfig.model : undefined;
  }, [flowType, nodes]);

  const isTestChatDisabled = currentFlow.isPublished === true;
  const isVoiceAgentFlow = flowType === FlowTypesEnum.VoiceAgent;

  // Memoize the custom node, edges types
  const customNodeTypeObjMemo = useMemo(() => CustomNodeTypeObj, []);
  const customEdgesTypeObjMemo = useMemo(() => CustomEdgeTypeObj, []);

  useCopyPasteShortcuts();

  useHistoryTracker(); // Initialize background  tracking
  useUndoRedoShortcuts(); // Initialize keyboard shortcuts

  // Tracks the node currently locked by this user so it can be released on deselect.
  const lockedNodeIdRef = useRef<string | null>(null);

  // Collaboration: presence, locking, and real-time edit broadcast.
  const {
    acquireLock,
    releaseLock,
    broadcastNodeChange,
    broadcastEdgeChange,
    broadcastGraphChange,
  } = useCollaboration();

  // Used to convert screen (client) coordinates to flow coordinates for cursor sharing.
  const { screenToFlowPosition } = useReactFlow();

  // Broadcast the local cursor position (in flow space) to collaborators, throttled.
  const onPaneMouseMove = useCallback(
    (event: React.MouseEvent) => {
      const pos = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      broadcastCursorEvent(pos.x, pos.y);
    },
    [screenToFlowPosition],
  );

  // Register the store's broadcasters so local edits reach other collaborators.
  useEffect(() => {
    setCollaborationBroadcasters(broadcastNodeChange, broadcastEdgeChange, broadcastGraphChange);
    return () => setCollaborationBroadcasters(null, null);
  }, [broadcastNodeChange, broadcastEdgeChange, broadcastGraphChange]);

  // Mirror the current canvas nodes into the live-execution store so the live loop index is
  // computed in a single place (the store) instead of inside every node/edge component.
  useEffect(() => {
    useLiveExecutionStore.getState().setNodes(nodes);
  }, [nodes]);

  // Collaboration: release the held node lock when the node configuration panel is
  // closed, since closing it does not necessarily clear the React Flow selection.
  const dcpShowDialog = useDynamicConfigPanelStore((state) => state.showDialog);
  const wasDialogOpenRef = useRef(dcpShowDialog);
  useEffect(() => {
    if (wasDialogOpenRef.current && !dcpShowDialog) {
      const lockedId = lockedNodeIdRef.current;
      if (lockedId) {
        releaseLock(`${currentFlow.versionId}:${LockTargetType.Node}:${lockedId}`);
        lockedNodeIdRef.current = null;
      }
    }
    wasDialogOpenRef.current = dcpShowDialog;
  }, [dcpShowDialog, releaseLock, currentFlow.versionId]);

  // Fetch flow details and set document title
  const { isLoading } = useFetchFlowToLoad();

  useFetchConfigKeys();

  // Confirm delete handler
  const { onBeforeDelete } = useConfirmDelete();

  // Reconnect nodes if a middle node is deleted
  const { onNodesDelete } = useOnNodeDelete();

  // Release locks for deleted nodes.
  const handleNodesDelete = useCallback(
    (deleted: Node[]) => {
      deleted.forEach((node) => {
        if (node.id) releaseLock(`${currentFlow.versionId}:${LockTargetType.Node}:${node.id}`);
      });
      onNodesDelete(deleted);
    },
    [onNodesDelete, releaseLock, currentFlow.versionId],
  );

  // Setter functions for context menu node
  const { setSelectedNode, setSelectedEdge, setMenu } = useContextMenuActionsStore(
    useShallow((state) => ({
      setSelectedNode: state.setSelectedNode,
      setSelectedEdge: state.setSelectedEdge,
      setMenu: state.setMenu,
    })),
  );

  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const recommendActions = useDefaultActions();

  const voiceIntroMessages = useVoiceIntroduction();

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
      // Single-node agents have no canvas actions — allow browser default menu.
      if (isSingleNodeAgentFlow(flowType)) return;
      event.preventDefault();
      const position = calculateMenuPosition(event);
      if (!position) return;

      setSelectedNode(node);
      setSelectedEdge(null);
      setMenu(position);

      if (import.meta.env.MODE !== "production") console.log("NODE:", node);
    },
    [setSelectedNode, setSelectedEdge, setMenu, flowType],
  );

  // Define onEdgeContextMenu handler
  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      // Single-node agents have no canvas actions — allow browser default menu.
      if (isSingleNodeAgentFlow(flowType)) return;
      event.preventDefault();
      const position = calculateMenuPosition(event);
      if (!position) return;

      setSelectedEdge(edge);
      setSelectedNode(null);
      setMenu(position);

      if (import.meta.env.MODE !== "production") console.log("EDGE:", edge);
    },
    [setSelectedNode, setSelectedEdge, setMenu, flowType],
  );

  const onPaneContextMenu = useCallback(
    (event: MouseEvent | React.MouseEvent<Element, MouseEvent>) => {
      // Single-node agents have no canvas actions — allow browser default menu.
      if (isSingleNodeAgentFlow(flowType)) return;
      event.preventDefault();
      const position = calculateMenuPosition(event);
      if (!position) return;

      setSelectedNode(null);
      setSelectedEdge(null);
      setMenu(position);
    },
    [setSelectedNode, setSelectedEdge, setMenu, flowType],
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

      // Collaboration locking: acquire a lock on the newly selected node and release
      // the previously locked node (or when the selection is cleared) so locks don't
      // leak when the user closes the config panel / deselects.
      const primaryId = nodes[0]?.id;
      const prevLockedId = lockedNodeIdRef.current;

      if (primaryId && primaryId !== prevLockedId) {
        if (prevLockedId) {
          releaseLock(`${currentFlow.versionId}:${LockTargetType.Node}:${prevLockedId}`);
        }
        acquireLock(LockTargetType.Node, primaryId);
        lockedNodeIdRef.current = primaryId;
      } else if (!primaryId && prevLockedId) {
        releaseLock(`${currentFlow.versionId}:${LockTargetType.Node}:${prevLockedId}`);
        lockedNodeIdRef.current = null;
      }
    },
    [
      setSelectedNode,
      setSelectedNodes,
      setMultipleNodesSelected,
      acquireLock,
      releaseLock,
      currentFlow.versionId,
    ],
  );

  // Render ReactFlow component
  return (
    <ResizablePanelGroup orientation="horizontal" className="!bg-slate-200 p-1.5">
      <ResizablePanel
        defaultSize="60%"
        minSize="35%"
        className="overflow-hidden rounded-xl bg-white"
      >
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
            onNodesDelete={handleNodesDelete}
            onSelectionChange={handleSelectionChange}
            onEdgesChange={onEdgesChange}
            onBeforeDelete={() => onBeforeDelete({ nodes, edges })}
            onConnect={onConnect}
            deleteKeyCode={"Delete"}
            onNodeContextMenu={onNodeContextMenu}
            onEdgeContextMenu={onEdgeContextMenu}
            onPaneContextMenu={onPaneContextMenu}
            onPaneClick={onPaneClick}
            onPaneMouseMove={onPaneMouseMove}
            // onlyRenderVisibleElements
            snapToGrid={true}
            snapGrid={[16, 16]}
          >
            <AutoFollowExecutingNode />
            <ViewControls />
            <ClearRunResultsPanel />
            <BackgroundExt />
            <MiniMapExt />
            <RemoteCursors />
          </ReactFlow>
          <ReactFlowContextMenu />
          <CanvasNodeDetailPanel />
          {/* Non-modal node config drawer — canvas-level mount next to the other
              fixed panels so it shares their stacking context. */}
          <DCPDialog />
          <FlowActionLockBanner />
          {(isLoading || isVersionTransitioning) && (
            <div className="absolute inset-0 -top-16 flex items-center justify-center  backdrop-blur-sm">
              <LoadingSpinner className="h-6 w-6 text-primary" />
            </div>
          )}
        </div>

        <ReactFlowDialogWrapper />
      </ResizablePanel>
      {isSingleNodeAgentFlow(flowType) && (
        <>
          <ResizableHandle withHandle className="w-1.5 mr-px bg-transparent" />
          <ResizablePanel defaultSize="40%" minSize="35%" className="overflow-hidden rounded-xl">
            <AvPlatformAssistantUI
              flowVersionId={currentFlow.versionId}
              mode="temporary"
              allowNewSession
              readOnly={isTestChatDisabled}
              readOnlyMessage={
                isTestChatDisabled
                  ? "Testing is unavailable while this agent is published."
                  : undefined
              }
              title={isVoiceAgentFlow ? "Voice Test" : "Test Chat"}
              badge="Test mode"
              description={
                chatModelLabel
                  ? `Live test · ${chatModelLabel} · history is not saved`
                  : "Live test · history is not saved"
              }
              initialMessages={voiceIntroMessages}
              isVoicePlayground={isVoiceAgentFlow}
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
