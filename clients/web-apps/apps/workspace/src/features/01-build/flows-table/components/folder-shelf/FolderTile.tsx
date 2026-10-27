import { cn } from "@avplatform/ui/lib";
import { NavLink } from "react-router-dom";

import { HighlightedText } from "@/components/HighlightedText";
import { MetaLine } from "@/components/MetaLine";
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
        "group/drop relative flex h-[4.5rem] items-center gap-3 rounded-lg bg-popover pl-3 pr-2 ring-1 ring-border transition-[background-color,outline-color] duration-200",
        "hover:ring-line-strong",
        "data-[drop-ready=true]:outline-dashed data-[drop-ready=true]:outline-[1.5px] data-[drop-ready=true]:outline-offset-[3px]",
        "data-[drop-active=true]:ring-[1.5px]",
        color.dropTarget,
      )}
    >
      <FolderMark
        color={color}
        className="transition-transform duration-200 group-hover/drop:scale-105"
      />
      <NavLink
        to={getFolderPagePath(folder.id)}
        draggable={false}
        className="block min-w-0 flex-1 outline-none after:absolute after:inset-0 after:rounded-lg focus-visible:after:ring-2 focus-visible:after:ring-focus"
      >
        <span className="block truncate text-[13.5px] font-semibold text-ink">
          <HighlightedText text={folder.name} query={searchText} />
        </span>
        <MetaLine
          className="mt-0.5 text-[12px] text-muted-foreground group-data-[drop-active=true]/drop:hidden"
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
        <span className="mt-0.5 hidden text-[12px] font-medium text-ink-2 group-data-[drop-active=true]/drop:block">
          Drop to move here
        </span>
      </NavLink>
      <div className="relative z-10 opacity-0 transition-opacity focus-within:opacity-100 group-hover/drop:opacity-100 has-[[data-state=open]]:opacity-100 [@media(hover:none)]:opacity-100">
        <FolderActionsMenu folder={folder} />
      </div>
    </div>
  );
};
