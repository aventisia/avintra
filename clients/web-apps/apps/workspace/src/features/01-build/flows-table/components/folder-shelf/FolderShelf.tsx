import { cn } from "@avplatform/ui/lib";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { PANEL_TRANSITION } from "../../constants/folder-motion.constant";
import { useFolderShelfCollapsed } from "../../hooks/useFolderShelfCollapsed.hook";
import { useMoveFlowToFolder } from "../../hooks/useMoveFlowToFolder.hook";
import { useAgentDragStore } from "../../stores/agent-drag.store";
import { FolderSummary } from "../../types/folder-summary.type";
import { MovableAgent } from "../../types/movable-agent.type";
import { FolderTile } from "./FolderTile";
import { NewFolderTile } from "./NewFolderTile";
import { SectionHeading } from "./SectionHeading";

type FolderShelfProps = {
  summaries: FolderSummary[];
  searchText: string;
};

const DragHint = ({ agentName }: { agentName: string }) => (
  <motion.p
    initial={{ opacity: 0, y: 4 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 4 }}
    transition={PANEL_TRANSITION}
    className="flex max-w-[22rem] items-center gap-2 rounded-full bg-selected px-2.5 py-1 text-[12px] font-medium text-primary-text ring-1 ring-primary/30"
  >
    <span className="size-2 shrink-0 rounded-full bg-primary" />
    <span className="truncate">Drop {agentName} on a folder</span>
  </motion.p>
);

/**
 * Folders section of the Agents page. It stays outside the agents paging so every folder is a
 * visible drop target, and it opens by itself while an agent is dragged.
 */
export const FolderShelf = ({ summaries, searchText }: FolderShelfProps) => {
  const draggedAgent = useAgentDragStore((state) => state.draggedAgent);
  const { isCollapsed, toggleCollapsed } = useFolderShelfCollapsed();
  const { moveFlow } = useMoveFlowToFolder();

  const isSearching = searchText.trim() !== "";
  const isExpanded = !isCollapsed || draggedAgent !== null;

  if (isSearching && summaries.length === 0) return null;

  const moveAgentInto = (summary: FolderSummary) => (agent: MovableAgent) =>
    moveFlow({
      flowId: agent.id,
      flowName: agent.name,
      folder: { id: summary.folder.id, name: summary.folder.name },
    });

  return (
    <section aria-labelledby="folders-shelf-heading" className="space-y-2.5">
      <SectionHeading
        id="folders-shelf-heading"
        title="Folders"
        count={summaries.length}
        actions={
          <>
            <AnimatePresence>
              {draggedAgent && <DragHint key="drag-hint" agentName={draggedAgent.name} />}
            </AnimatePresence>
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-expanded={isExpanded}
              aria-controls="folders-shelf-grid"
              className="inline-flex h-7 items-center gap-1 rounded-lg px-2 text-[12px] font-medium text-muted-foreground outline-none transition hover:bg-muted hover:text-ink focus-visible:ring-2 focus-visible:ring-focus"
            >
              {isCollapsed ? "Show" : "Hide"}
              <ChevronDown
                className={cn(
                  "size-3.5 transition-transform duration-200",
                  !isCollapsed && "rotate-180",
                )}
              />
            </button>
          </>
        }
      />

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="folders-shelf-grid"
            id="folders-shelf-grid"
            initial={{ height: 0, opacity: 0, overflow: "hidden" }}
            animate={{ height: "auto", opacity: 1, transitionEnd: { overflow: "visible" } }}
            exit={{ height: 0, opacity: 0, overflow: "hidden" }}
            transition={PANEL_TRANSITION}
          >
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-3 pb-1">
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
                  <NewFolderTile
                    draggedAgent={draggedAgent}
                    isFirstFolder={summaries.length === 0}
                  />
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
