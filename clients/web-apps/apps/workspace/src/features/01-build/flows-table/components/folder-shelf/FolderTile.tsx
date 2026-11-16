import { HighlightedText } from "@avplatform/ui/highlighted-text";
import { cn } from "@avplatform/ui/lib";
import { MetaLine } from "@avplatform/ui/meta-line";
import { NavLink } from "react-router-dom";

import { pluralize } from "@/utils/pluralize.util";

import { useAgentsPagePaths } from "../../hooks/useAgentsPagePaths.hook";
import { FolderSummary } from "../../types/folder-summary.type";
import { MovableAgent } from "../../types/movable-agent.type";
import { getAgentDropHandlers } from "../../utils/agent-drag.util";
import { getFolderColor } from "../../utils/folder-color.util";
import { FolderActionsMenu } from "../folder/FolderActionsMenu";
import { FolderMark } from "../folder/FolderMark";

type FolderTileProps = {
  summary: FolderSummary;
  searchText: string;
  draggedAgent: MovableAgent | null;
  onDropAgent: (agent: MovableAgent) => void;
};

/**
 * Shelf tile that opens a folder and accepts dragged agents.
 */
export const FolderTile = ({
  summary: { folder, visibleAgentCount },
  searchText,
  draggedAgent,
  onDropAgent,
}: FolderTileProps) => {
  const color = getFolderColor(folder);
  const { getFolderPagePath } = useAgentsPagePaths();
  const canAccept = (agent: MovableAgent) => agent.folderId !== folder.id;
  const isDropReady = draggedAgent !== null && canAccept(draggedAgent);

  return (
    <div
      {...getAgentDropHandlers(onDropAgent, canAccept)}
      data-drop-ready={isDropReady || undefined}
      className={cn(
        "group/drop relative flex min-h-[52px] items-center gap-[11px] rounded-md bg-surface py-2.5 pl-3 pr-2 ring-1 ring-line transition-[background-color,outline-color] duration-200",
        "hover:ring-line-strong",
        "data-[drop-ready=true]:outline-dashed data-[drop-ready=true]:outline-[1.5px] data-[drop-ready=true]:outline-offset-[3px]",
        "data-[drop-active=true]:ring-[1.5px]",
        color.dropTarget,
      )}
    >
      <FolderMark
        color={color}
        className="size-8 rounded-md transition-transform duration-200 group-hover/drop:scale-105 [&>svg]:size-4"
      />
      <NavLink
        to={getFolderPagePath(folder.id)}
        draggable={false}
        className="block min-w-0 flex-1 outline-none after:absolute after:inset-0 after:rounded-md focus-visible:after:ring-2 focus-visible:after:ring-focus"
      >
        <span className="block truncate text-[13.5px] font-semibold text-ink">
          <HighlightedText text={folder.name} query={searchText} />
        </span>
        <MetaLine
          className="mt-0.5 text-[12px] text-muted-foreground"
          items={[
            visibleAgentCount > 0
              ? `${visibleAgentCount} ${pluralize(visibleAgentCount, "agent")}`
              : "Empty",
            folder.description && (
              <span title={folder.description} className="relative z-[1]">
                {folder.description}
              </span>
            ),
          ]}
        />
      </NavLink>
      <div className="relative z-10 opacity-0 transition-opacity focus-within:opacity-100 group-hover/drop:opacity-100 has-[[data-state=open]]:opacity-100 [@media(hover:none)]:opacity-100">
        <FolderActionsMenu folder={folder} />
      </div>
    </div>
  );
};
