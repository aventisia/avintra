import { cn } from "@avplatform/ui/lib";
import { FolderPlus } from "lucide-react";

import { useFolderFormDialog } from "../../hooks/useFolderFormDialog.hook";
import { MovableAgent } from "../../types/movable-agent.type";
import { getAgentDropHandlers } from "../../utils/agent-drag.util";

type NewFolderTileProps = {
  draggedAgent: MovableAgent | null;
  isFirstFolder: boolean;
};

const getCopy = (isDropReady: boolean, isFirstFolder: boolean) => {
  if (isDropReady) return { title: "New folder", hint: "Drop to create it with this agent" };
  if (isFirstFolder) {
    return {
      title: "Create your first folder",
      hint: "Group related agents, then drag agents in or use Move to folder on any agent.",
    };
  }
  return { title: "New folder", hint: "Group related agents" };
};

/**
 * Dashed tile that creates a folder; dropping an agent on it creates the folder with that agent inside.
 */
export const NewFolderTile = ({ draggedAgent, isFirstFolder }: NewFolderTileProps) => {
  const { openCreateFolderDialog } = useFolderFormDialog();
  const isDropReady = draggedAgent !== null;
  const { title, hint } = getCopy(isDropReady, isFirstFolder);

  return (
    <button
      type="button"
      onClick={() => openCreateFolderDialog()}
      {...getAgentDropHandlers((agent) => openCreateFolderDialog({ agentToMove: agent }))}
      data-drop-ready={isDropReady || undefined}
      className={cn(
        "group/drop flex h-[4.5rem] w-full items-center gap-3 rounded-lg border border-dashed border-line bg-sunken/50 px-3 text-left text-muted-foreground outline-none transition duration-200",
        "hover:border-primary hover:bg-selected hover:text-primary-text focus-visible:ring-2 focus-visible:ring-focus",
        "data-[drop-ready=true]:border-primary/30 data-[drop-ready=true]:text-primary-text",
        "data-[drop-active=true]:border-primary data-[drop-active=true]:bg-selected",
      )}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-popover ring-1 ring-border transition group-hover/drop:ring-primary/30 group-data-[drop-active=true]/drop:rotate-6 group-data-[drop-active=true]/drop:scale-110">
        <FolderPlus className="size-[18px]" />
      </span>
      <span className="min-w-0">
        <span className="block text-[13.5px] font-semibold">{title}</span>
        <span className="block truncate text-[12px] text-muted-foreground group-hover/drop:text-primary-text/80">
          {hint}
        </span>
      </span>
    </button>
  );
};
