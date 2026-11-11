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
        "group/drop flex h-[4.5rem] w-full items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 px-3 text-left text-slate-500 outline-none transition duration-200",
        "hover:border-indigo-400 hover:bg-indigo-50/40 hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/50",
        "data-[drop-ready=true]:border-indigo-300 data-[drop-ready=true]:text-indigo-600",
        "data-[drop-active=true]:-translate-y-0.5 data-[drop-active=true]:border-indigo-500 data-[drop-active=true]:bg-indigo-50",
      )}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-popover shadow-sm ring-1 ring-border transition group-hover/drop:ring-indigo-200 group-data-[drop-active=true]/drop:rotate-6 group-data-[drop-active=true]/drop:scale-110">
        <FolderPlus className="size-[18px]" />
      </span>
      <span className="min-w-0">
        <span className="block text-[13.5px] font-semibold">{title}</span>
        <span className="block truncate text-[12px] text-slate-400 group-hover/drop:text-indigo-500/80">
          {hint}
        </span>
      </span>
    </button>
  );
};
