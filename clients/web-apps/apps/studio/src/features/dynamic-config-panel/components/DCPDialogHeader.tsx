import { Input } from "@avplatform/ui";
import { Button, buttonVariants } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { PencilIcon, SquareArrowOutUpRightIcon, X } from "lucide-react";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { PanelHeader, PanelTitle } from "@/components/panel/components/Panel";
import { usePanelStore } from "@/components/panel/stores/panel-store";
import { useLocalFileStore } from "@/features/file-viewer/stores/file-list-store";
import { useIsVersionHistoryRoute } from "@/features/version-history/hooks/useIsVersionHistoryRoute";

import { useDCPNavigationGuard } from "../hooks/useDCPNavigationGuard";
import { DCP_PANEL_ID, useDynamicConfigPanelStore } from "../stores/dcp-store";

const DCPDialogHeader = () => {
  const [editing, setEditing] = useState(false);

  // Get node unique name state (required to get config panel data)
  const {
    nodeData,
    nodeLabel = "Dynamic Config Panel",
    setNodeLabel,
    closeNodeConfig,
  } = useDynamicConfigPanelStore(
    useShallow((state) => ({
      nodeLabel: state.nodeLabel,
      nodeData: state.nodeData,
      setNodeLabel: state.setNodeLabel,
      closeNodeConfig: state.closeNodeConfig,
    })),
  );

  const closePanel = usePanelStore((s) => s.closePanel);
  const clearAllFiles = useLocalFileStore((s) => s.clearAllFiles);
  const guardNavigation = useDCPNavigationGuard();

  // Explicit close: clear staged files and close both stores synchronously.
  // Guarded — prompts when the form has unsaved edits. (Escape only touches
  // panel-store via the panel hotkey; DCPDialog's reverse-sync propagates that
  // path as a safety net.)
  const handleClose = () => {
    guardNavigation(() => {
      clearAllFiles();
      closeNodeConfig();
      closePanel(DCP_PANEL_ID);
    });
  };

  const isAgentHistory = useIsVersionHistoryRoute();

  // Renders the appropriate info link based on node type
  const renderInfoLink = () => {
    if (!nodeData) return null;

    let href = "#";
    let label = "Docs";

    switch (nodeData.type) {
      case "callAgentNode":
        if (nodeData?.selectedAgent) {
          href = `${import.meta.env.VITE_STUDIO_PATH}agent?f=${nodeData.selectedAgent?.flowId}&v=${nodeData.selectedAgent?.id}`;
          label = "Open Agent";
        } else {
          return null; // Don't render anything if there's no agent
        }
        break;

      default:
        href = nodeData.docsLink || "#";
        label = "Docs";
    }

    return (
      <a
        className={cn(buttonVariants({ variant: "link" }), "gap-1 text-xs")}
        target="_blank"
        href={href}
      >
        {label}
        <SquareArrowOutUpRightIcon className="h-2.5 w-2.5 stroke-[2.5]" />
      </a>
    );
  };

  return (
    <PanelHeader className="h-16 text-lg">
      {/* Left side - Panel Heading and description */}
      <div className="flex min-w-0 flex-col gap-[1px]">
        <PanelTitle className="flex items-center !text-[0.91rem]">
          {editing ? (
            <Input
              name="label"
              className="h-5 w-[24rem] !max-w-[24rem] truncate !border-0 !border-none !p-0 !text-base !font-semibold !shadow-none !outline-none !ring-0"
              value={nodeLabel}
              autoFocus
              onChange={(e) => setNodeLabel(e.target.value)}
              onBlur={() => setEditing(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setEditing(false);
                // Don't let panel-level Escape close the panel while renaming
                if (e.key === "Escape") {
                  e.stopPropagation();
                  setEditing(false);
                }
              }}
            />
          ) : (
            <div
              onClick={() => {
                if (!isAgentHistory) setEditing(true);
              }}
              className="flex h-5 items-center gap-2"
            >
              <span className="max-w-[24rem] overflow-hidden truncate text-[0.91rem]">
                {nodeLabel}
              </span>
              {!isAgentHistory && <PencilIcon className="h-3 w-3 text-muted-foreground" />}
            </div>
          )}
        </PanelTitle>
        <div className="flex gap-1">
          <p
            className={cn(
              "!inline !max-w-[24rem] !truncate text-xs tracking-normal text-muted-foreground",
              nodeData?.name === "ConditionalBranchActivity" && "!max-w-[35rem]",
              nodeData?.name === "LoopActivity" && "!max-w-[35rem]",
              (nodeData?.name.includes("AIAgent") || nodeData?.name.includes("WorkItem")) &&
                "!max-w-[calc(((100vw-(2*var(--header-padding)))/2)-8rem)]",
            )}
            title={nodeData?.description}
          >
            {nodeData?.description
              ? nodeData?.description + (nodeData?.description?.endsWith(".") ? "" : ".")
              : "Node Configuration."}
          </p>
          {renderInfoLink()}
        </div>
      </div>

      {/* Right side - explicit Close action */}
      <Button
        variant="ghost"
        size="icon8"
        onClick={handleClose}
        aria-label="Close panel"
        className="shrink-0"
      >
        <X className="h-5 w-5 text-[--icon-color]" />
        <span className="sr-only">Close</span>
      </Button>
    </PanelHeader>
  );
};

export default DCPDialogHeader;
