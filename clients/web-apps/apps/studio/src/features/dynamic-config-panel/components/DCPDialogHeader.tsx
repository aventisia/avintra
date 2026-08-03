import { Input } from "@avplatform/ui";
import { buttonVariants } from "@avplatform/ui/buttons";
import { DialogClose, DialogDescription, DialogTitle } from "@avplatform/ui/dialog";
import { cn } from "@avplatform/ui/lib";
import { PencilIcon, SquareArrowOutUpRightIcon, X } from "lucide-react";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useIsVersionHistoryRoute } from "@/features/version-history/hooks/useIsVersionHistoryRoute";

import { useDynamicConfigPanelStore } from "../stores/dcp-store";

const DCPDialogHeader = () => {
  const [editing, setEditing] = useState(false);

  // Get node unique name state (required to get config panel data)
  const {
    nodeData,
    nodeLabel = "Dynamic Config Panel",
    setNodeLabel,
  } = useDynamicConfigPanelStore(
    useShallow((state) => ({
      nodeLabel: state.nodeLabel,
      nodeData: state.nodeData,
      setNodeLabel: state.setNodeLabel,
    })),
  );

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
    <div
      className={cn(
        "flex h-16 items-center justify-between gap-2 border-b pl-4 pr-2 text-lg tracking-wide",
      )}
    >
      {/* Left side - Dialog Heading and description */}
      <div className="flex flex-col gap-[1px]">
        <DialogTitle className="flex items-center font-semibold text-foreground">
          {editing ? (
            <Input
              name="label"
              className="h-5 w-[24rem] !max-w-[24rem] truncate !border-0 !border-none !p-0 !text-base !font-semibold !shadow-none !outline-none !ring-0"
              value={nodeLabel}
              autoFocus
              onChange={(e) => setNodeLabel(e.target.value)}
              onBlur={() => setEditing(false)}
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
        </DialogTitle>
        <div className="flex gap-1">
          <DialogDescription
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
          </DialogDescription>
          {renderInfoLink()}
        </div>
      </div>

      {/* Right side - Close Dialog action buttons */}
      <DialogClose className={buttonVariants({ variant: "ghost", size: "icon8" })}>
        <X className="h-5 w-5 text-[--icon-color]" />
        <span className="sr-only">Close</span>
      </DialogClose>
    </div>
  );
};

export default DCPDialogHeader;
