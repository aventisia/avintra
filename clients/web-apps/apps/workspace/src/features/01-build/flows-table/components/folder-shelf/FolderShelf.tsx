import { cn } from "@avplatform/ui/lib";

import { useMoveFlowToFolder } from "../../hooks/useMoveFlowToFolder.hook";
import { useAgentDragStore } from "../../stores/agent-drag.store";
import { FolderSummary } from "../../types/folder-summary.type";
import { MovableAgent } from "../../types/movable-agent.type";
import { FolderTile } from "./FolderTile";
import { NewFolderTile } from "./NewFolderTile";

type FolderShelfProps = {
  summaries: FolderSummary[];
  searchText: string;
};

/**
 * Folders section of the Agents page. It stays outside the agents paging so every folder is a
 * visible drop target.
 */
export const FolderShelf = ({ summaries, searchText }: FolderShelfProps) => {
  const draggedAgent = useAgentDragStore((state) => state.draggedAgent);
  const { moveFlow } = useMoveFlowToFolder();

  const isSearching = searchText.trim() !== "";

  if (isSearching && summaries.length === 0) return null;

  const moveAgentInto = (summary: FolderSummary) => (agent: MovableAgent) =>
    moveFlow({
      flowId: agent.id,
      flowName: agent.name,
      folder: { id: summary.folder.id, name: summary.folder.name },
    });

  return (
    <section aria-label="Folders">
      <ul className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {summaries.map((summary) => (
          <li key={summary.folder.id}>
            <FolderTile
              summary={summary}
              searchText={searchText}
              draggedAgent={draggedAgent}
              onDropAgent={moveAgentInto(summary)}
            />
          </li>
        ))}
        {!isSearching && (
          <li className={cn(summaries.length === 0 && "col-span-full")}>
            <NewFolderTile draggedAgent={draggedAgent} isFirstFolder={summaries.length === 0} />
          </li>
        )}
      </ul>
    </section>
  );
};
