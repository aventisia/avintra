import { FlowTypesEnum } from "@avplatform/ui/enums";
import { cn } from "@avplatform/ui/lib";
import { useAlertDialogStore } from "@avplatform/ui/stores";
import { memo, useEffect, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useShallow } from "zustand/react/shallow";

import { Panel } from "@/components/panel/components/Panel";
import { usePanelStore } from "@/components/panel/stores/panel-store";
import CallAgentConfigForm from "@/features/call-agent/CallAgentConfigForm";
import CallBlockConfigForm from "@/features/call-block/CallBlockConfigForm";
import { CANVAS_NODE_DETAIL_PANEL_ID } from "@/features/execute-flow/components/ClearRunResultsPanel";
import FileViewer from "@/features/file-viewer/components/FileViewer";
import { useLocalFileStore } from "@/features/file-viewer/stores/file-list-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { useVariableSelectorStore } from "@/stores/variable-selector-store";

import { DCPForm, useDCPNavigationGuard, useDynamicConfigPanelStore } from "..";
import { DCP_PANEL_ID } from "../stores/dcp-store";
import DCPDialogHeader from "./DCPDialogHeader";

// Memoized: now mounted inside ReactFlowExt's canvas tree (which re-renders on
// every nodes/edges change), so skip parent-driven re-renders. Store
// subscriptions still update it when relevant.
export const DCPDialog = memo(({ children }: React.PropsWithChildren) => {
  // Get state and actions from the DynamicConfigPanel store
  const {
    showDialog,
    showViewer,
    nodeId,
    nodeData,
    setShowDialog,
    setShowViewer,
    closeNodeConfig,
  } = useDynamicConfigPanelStore(
    useShallow((state) => ({
      showDialog: state.showDialog,
      showViewer: state.showViewer,
      nodeId: state.nodeId,
      nodeData: state.nodeData,
      setShowDialog: state.setShowDialog,
      setShowViewer: state.setShowViewer,
      closeNodeConfig: state.closeNodeConfig,
    })),
  );

  const { clearAllFiles } = useLocalFileStore(
    useShallow((s) => ({ clearAllFiles: s.clearAllFiles })),
  );

  const openPanel = usePanelStore((s) => s.openPanel);
  const closePanel = usePanelStore((s) => s.closePanel);
  const isPanelOpen = usePanelStore((s) => s.panels[DCP_PANEL_ID]?.isOpen ?? false);

  // ChatAgent flows share the canvas pane with the always-visible test chat, so
  // the config fills the canvas. Other flows keep their historic drawer widths.
  const flowType = useReactFlowExtStore((s) => s.flowType);
  const isChatAgent = flowType === FlowTypesEnum.ChatAgent;

  // Forward sync: dcp-store is the source of truth, panel-store is its mirror.
  // DCP wins the right dock: opening it displaces the run-results detail
  // drawer (both are fixed right-2 drawers and would otherwise overlap).
  useEffect(() => {
    if (showDialog) {
      openPanel(DCP_PANEL_ID, "right");
      closePanel(CANVAS_NODE_DETAIL_PANEL_ID);
    } else {
      closePanel(DCP_PANEL_ID);
    }
  }, [showDialog, openPanel, closePanel]);

  // Reverse sync: safety net for panel-store-only closes. (The header X and the
  // guarded Escape below close both stores explicitly.)
  const wasPanelOpenRef = useRef(isPanelOpen);
  useEffect(() => {
    if (wasPanelOpenRef.current && !isPanelOpen && showDialog) {
      // Commit any pending form edits before the panel disappears. Always
      // persists — including incomplete/invalid edits — so a panel-store-only
      // close never drops mid-edit state.
      void useDynamicConfigPanelStore.getState().flushForm?.();
      clearAllFiles();
      setShowDialog(false);
    }
    wasPanelOpenRef.current = isPanelOpen;
  }, [isPanelOpen, showDialog, clearAllFiles, setShowDialog]);

  // Node switch while open: reset the file viewer — staged files belong to the
  // previous node (matches old modal semantics where switching required close,
  // and close cleared files).
  const prevNodeIdRef = useRef(nodeId);
  useEffect(() => {
    if (prevNodeIdRef.current !== nodeId) {
      prevNodeIdRef.current = nodeId;
      if (showDialog) {
        setShowViewer(false);
        clearAllFiles();
      }
    }
  }, [nodeId, showDialog, setShowViewer, clearAllFiles]);

  // Guarded Escape: Panel's own closeOnEscape stays off so dirty edits flush
  // (always persisted, even incomplete/invalid) instead of vanishing, and the
  // panel still closes. Disabled while
  // the confirm is open so Escape dismisses the confirm, not the panel behind it.
  const guardNavigation = useDCPNavigationGuard();
  const isAlertDialogOpen = useAlertDialogStore((s) => s.isAlertDialogOpen);
  useHotkeys(
    "esc",
    (e) => {
      // Let floating Radix layers (variable selector, selects, dropdowns,
      // tooltips) and the variable selector consume Escape first — closing the
      // panel underneath would strand their state
      const target = e.target as HTMLElement | null;
      if (target?.closest?.("[data-radix-popper-content-wrapper]")) return;
      if (useVariableSelectorStore.getState().isOpen) return;

      void guardNavigation(() => {
        clearAllFiles();
        closeNodeConfig();
        closePanel(DCP_PANEL_ID);
      });
    },
    {
      enabled: showDialog && isPanelOpen && !isAlertDialogOpen,
      preventDefault: true,
    },
    [
      showDialog,
      isPanelOpen,
      isAlertDialogOpen,
      guardNavigation,
      clearAllFiles,
      closeNodeConfig,
      closePanel,
    ],
  );

  // Function to render correct form component based on nodeData.type
  const renderFormComponent = () => {
    switch (nodeData?.type) {
      case "callAgentNode":
        return <CallAgentConfigForm />;
      case "blockNode":
        return <CallBlockConfigForm />;
      default:
        return <DCPForm />;
    }
  };

  // Default 29.25rem inspector, wide nodes 40rem, AIAgent/WorkItem half viewport, file-viewer full width.
  const panelWidth = showViewer
    ? "w-screen"
    : nodeData?.name.includes("AIAgent") || nodeData?.name.includes("WorkItem")
      ? "w-[50vw]"
      : nodeData?.name === "ConditionalBranchActivity" || nodeData?.name === "LoopActivity"
        ? "w-[40rem]"
        : "w-[29.25rem]";

  return (
    <>
      {children}
      <Panel
        id={DCP_PANEL_ID}
        side="right"
        contained={isChatAgent}
        flush={!isChatAgent}
        fill={isChatAgent}
        width={panelWidth}
        className="rounded-none border-y-0 border-r-0 shadow-none"
        // Off: Escape is handled above with the dirty-form guard
        closeOnEscape={false}
      >
        <div className={cn("flex h-full", showViewer && "grid grid-cols-2")}>
          <div className={cn(showViewer ? "border-r border-line" : "hidden")}>
            <FileViewer />
          </div>
          <div className={cn("flex min-h-0 min-w-0 flex-1 flex-col")}>
            <DCPDialogHeader />
            {renderFormComponent()}
          </div>
        </div>
      </Panel>
    </>
  );
});

DCPDialog.displayName = "DCPDialog";
