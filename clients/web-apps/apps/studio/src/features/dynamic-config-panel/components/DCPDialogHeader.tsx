import { Input } from "@avplatform/ui";
import { Button, buttonVariants } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { PencilIcon, SquareArrowOutUpRightIcon, X } from "lucide-react";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { iconMapper } from "@/components/icon-mapper";
import { NodeImage } from "@/components/node-container/node-header/NodeImage";
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

  // Explicit close: flush pending edits, then clear staged files and close both
  // stores. Guarded — aborts (panel stays open) when the form is invalid.
  // (Escape only touches panel-store via the panel hotkey; DCPDialog's
  // reverse-sync propagates that path as a safety net.)
  const handleClose = () => {
    void guardNavigation(() => {
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
        className={cn(buttonVariants({ variant: "ghost", size: "icon7" }))}
        target="_blank"
        href={href}
        aria-label={label}
        title={label}
      >
        <SquareArrowOutUpRightIcon className="size-3.5" />
      </a>
    );
  };

  const nodeIcon =
    nodeData?.type === "callAgentNode" ? (
      <NodeImage src="/assets/NewAgentIcon.svg" />
    ) : nodeData?.type === "blockNode" ? (
      <NodeImage src="/assets/BlockNodeIconLight.svg" />
    ) : nodeData?.iconUrl ? (
      <NodeImage src={nodeData.iconUrl} />
    ) : nodeData?.icon && iconMapper[nodeData.icon] ? (
      iconMapper[nodeData.icon]
    ) : (
      <NodeImage src={nodeData?.img} />
    );

  const description = nodeData?.description || "Node Configuration.";

  return (
    <PanelHeader className="h-16 gap-3">
      <div
        aria-hidden
        className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-md border border-line bg-sunken [&>div]:bg-transparent [&_img]:size-5 [&_img]:opacity-100 [&_svg]:size-4"
      >
        {nodeIcon}
      </div>

      <div className="flex min-w-0 flex-1 flex-col" title={description}>
        <span className="truncate font-mono text-label uppercase text-muted-foreground">
          {nodeData?.category || nodeData?.name || "Step"}
        </span>
        <PanelTitle className="flex min-w-0 items-center text-heading text-ink">
          {editing ? (
            <Input
              name="label"
              fieldSize="xs"
              className="w-full"
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
              className="group flex min-w-0 items-center gap-1.5"
            >
              <span className="truncate">{nodeLabel}</span>
              {!isAgentHistory && (
                <PencilIcon className="size-3 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100" />
              )}
            </div>
          )}
        </PanelTitle>
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        {renderInfoLink()}
        <Button variant="ghost" size="icon7" onClick={handleClose} aria-label="Close panel">
          <X className="size-4" />
        </Button>
      </div>
    </PanelHeader>
  );
};

export default DCPDialogHeader;
