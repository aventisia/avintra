import { ChevronRight } from "lucide-react";
import { NavLink } from "react-router-dom";

import { TABLE_HEADING } from "../../constants";
import { useAgentsPagePaths } from "../../hooks/useAgentsPagePaths.hook";
import { useMoveFlowToFolder } from "../../hooks/useMoveFlowToFolder.hook";
import { useAgentDragStore } from "../../stores/agent-drag.store";
import { FolderSummary } from "../../types/folder-summary.type";
import { MovableAgent } from "../../types/movable-agent.type";
import { getAgentDropHandlers } from "../../utils/agent-drag.util";
import { FolderSwitcher } from "./FolderSwitcher";

type FolderBreadcrumbProps = {
  current: FolderSummary;
  summaries: FolderSummary[];
};

const isInFolder = (agent: MovableAgent) => agent.folderId !== null;

/**
 * "Agents › folder" trail. Dropping an agent on "Agents" takes it out of its folder.
 */
export const FolderBreadcrumb = ({ current, summaries }: FolderBreadcrumbProps) => {
  const draggedAgent = useAgentDragStore((state) => state.draggedAgent);
  const { moveFlow } = useMoveFlowToFolder();
  const { agentsPagePath } = useAgentsPagePaths();
  const isDropReady = draggedAgent !== null && isInFolder(draggedAgent);

  const moveToTopLevel = (agent: MovableAgent) =>
    moveFlow({ flowId: agent.id, flowName: agent.name, folder: null });

  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1">
      <NavLink
        to={agentsPagePath}
        draggable={false}
        {...getAgentDropHandlers(moveToTopLevel, isInFolder)}
        data-drop-ready={isDropReady || undefined}
        title={isDropReady ? "Drop to take the agent out of this folder" : undefined}
        className="rounded-lg px-1.5 py-0.5 text-lg font-medium text-slate-500 outline-none outline-offset-2 transition hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-500/50 data-[drop-active=true]:bg-indigo-50 data-[drop-ready=true]:outline-dashed data-[drop-ready=true]:outline-[1.5px] data-[drop-ready=true]:outline-indigo-300 data-[drop-active=true]:text-indigo-700 data-[drop-active=true]:outline-indigo-500"
      >
        {TABLE_HEADING}
      </NavLink>
      <ChevronRight className="size-4 shrink-0 text-slate-300" />
      <FolderSwitcher current={current} summaries={summaries} />
    </nav>
  );
};
