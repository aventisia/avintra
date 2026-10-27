import { cn } from "@avplatform/ui/lib";
import { getMutationErrorMessage } from "@avplatform/ui/utils";
import { ArrowRight, FolderSearch, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useId, useState } from "react";

import { AgentAvatar } from "@/components/AgentAvatar";
import { Kbd } from "@/components/Kbd";
import { CardDialog } from "@/components/card-dialog/CardDialog";
import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
import { StatusLine } from "@/components/card-dialog/StatusLine";

import { PANEL_TRANSITION } from "../../constants/folder-motion.constant";
import { FOLDER_NAME_MAX_LENGTH } from "../../constants/folder-zod-schema.constant";
import { useMoveFlowToFolder } from "../../hooks/useMoveFlowToFolder.hook";
import { useMoveTargetPicker } from "../../hooks/useMoveTargetPicker.hook";
import { useSaveFolder } from "../../hooks/useSaveFolder.hook";
import { FolderColor } from "../../types/folder-color.type";
import { FolderSummary } from "../../types/folder-summary.type";
import { MovableAgent } from "../../types/movable-agent.type";
import { MoveTarget } from "../../types/move-target.type";
import { getFolderColor, getRandomFolderColor } from "../../utils/folder-color.util";
import { getMoveTargetKey } from "../../utils/move-targets.util";
import { AgentsRootMark, FolderMark } from "../folder/FolderMark";
import { MoveTargetOption } from "./MoveTargetOption";

type MoveAgentDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  agent: MovableAgent;
  summaries: FolderSummary[];
};

const LocationChip = ({
  target,
  newFolderColor,
}: {
  target: MoveTarget;
  newFolderColor: FolderColor;
}) => {
  if (target.kind === "root") {
    return (
      <span className="flex min-w-0 items-center gap-1.5">
        <AgentsRootMark size="xs" />
        <span className="truncate">Agents</span>
      </span>
    );
  }

  const [color, name] =
    target.kind === "folder"
      ? [getFolderColor(target.summary.folder), target.summary.folder.name]
      : [newFolderColor, target.name];

  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <FolderMark color={color} size="xs" />
      <span className="truncate">{name}</span>
    </span>
  );
};

const getSubmitLabel = (target: MoveTarget | null, isBusy: boolean) => {
  if (isBusy) return "Creating";
  return target?.kind === "create" ? "Create and move" : "Move";
};

/**
 * Picks the folder an agent moves to: search, the top level, existing folders, or a new folder
 * named after the search.
 */
export const MoveAgentDialog = ({ isOpen, onClose, agent, summaries }: MoveAgentDialogProps) => {
  const listId = useId();
  const { moveFlow } = useMoveFlowToFolder();
  const { saveFolder, isSaving } = useSaveFolder();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [newFolderColor] = useState(getRandomFolderColor);

  const currentSummary = summaries.find(({ folder }) => folder.id === agent.folderId);
  const currentLocation: MoveTarget = currentSummary
    ? { kind: "folder", summary: currentSummary }
    : { kind: "root" };

  const moveTo = async (target: MoveTarget) => {
    if (isSaving) return;
    setSubmitError(null);

    if (target.kind === "root") {
      moveFlow({ flowId: agent.id, flowName: agent.name, folder: null });
    } else if (target.kind === "folder") {
      const { id, name } = target.summary.folder;
      moveFlow({ flowId: agent.id, flowName: agent.name, folder: { id, name } });
    } else {
      try {
        const { data: createdFolder } = await saveFolder({
          name: target.name,
          description: "",
          color: newFolderColor.key,
        });
        moveFlow({
          flowId: agent.id,
          flowName: agent.name,
          folder: { id: createdFolder.id, name: createdFolder.name },
        });
      } catch (error) {
        setSubmitError(getMutationErrorMessage(error));
        return;
      }
    }
    onClose();
  };

  const {
    query,
    setQuery,
    targets,
    highlightIndex,
    setHighlightIndex,
    selectedTarget,
    choose,
    handleKeyDown,
  } = useMoveTargetPicker({
    summaries,
    currentFolderId: currentSummary ? agent.folderId : null,
    onSubmit: moveTo,
  });

  const optionId = useCallback((index: number) => `${listId}-option-${index}`, [listId]);

  useEffect(() => {
    if (highlightIndex >= 0) {
      document.getElementById(optionId(highlightIndex))?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIndex, optionId]);

  const trimmedQuery = query.trim();
  const hasOtherFolders = summaries.length > (currentSummary ? 1 : 0);

  return (
    <CardDialog
      isOpen={isOpen}
      onClose={onClose}
      isDismissLocked={isSaving}
      mark={<AgentAvatar size="lg" className="size-12 rounded-lg [&>svg]:size-6" />}
      eyebrow="Move agent"
      title={agent.name}
      footer={
        <>
          {submitError ? (
            <StatusLine tone="error">{submitError}</StatusLine>
          ) : (
            <StatusLine tone={selectedTarget ? "pending" : "idle"}>
              <LocationChip target={currentLocation} newFolderColor={newFolderColor} />
              <AnimatePresence initial={false}>
                {selectedTarget && (
                  <motion.span
                    key={getMoveTargetKey(selectedTarget)}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={PANEL_TRANSITION}
                    className="flex min-w-0 items-center gap-1.5"
                  >
                    <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
                    <LocationChip target={selectedTarget} newFolderColor={newFolderColor} />
                  </motion.span>
                )}
              </AnimatePresence>
            </StatusLine>
          )}
          <div className="flex shrink-0 items-center gap-2">
            <CardDialogButton onClick={onClose} disabled={isSaving}>
              Cancel
            </CardDialogButton>
            <CardDialogButton
              variant="primary"
              disabled={!selectedTarget || isSaving}
              isBusy={isSaving}
              onClick={() => selectedTarget && moveTo(selectedTarget)}
            >
              {getSubmitLabel(selectedTarget, isSaving)}
            </CardDialogButton>
          </div>
        </>
      }
    >
      <div className="relative flex h-control-lg items-center rounded-md bg-popover ring-1 ring-border transition-shadow focus-within:ring-focus">
        <Search className="pointer-events-none absolute left-3.5 size-4 text-muted-foreground" />
        <input
          data-autofocus
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={highlightIndex >= 0 ? optionId(highlightIndex) : undefined}
          aria-label="Search folders or name a new one"
          value={query}
          maxLength={FOLDER_NAME_MAX_LENGTH}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search folders or type a new name…"
          className="h-full w-full bg-transparent pl-10 pr-3 text-[13.5px] text-ink outline-none placeholder:text-muted-foreground"
        />
      </div>

      <ul
        id={listId}
        role="listbox"
        aria-label="Destinations"
        className="-mx-2 mt-3 max-h-[17rem] overflow-y-auto overscroll-contain px-0.5"
      >
        {targets.map((target, index) => (
          <MoveTargetOption
            key={getMoveTargetKey(target)}
            id={optionId(index)}
            target={target}
            query={trimmedQuery}
            isHighlighted={index === highlightIndex}
            isSelected={
              selectedTarget !== null &&
              getMoveTargetKey(selectedTarget) === getMoveTargetKey(target)
            }
            onHighlight={() => setHighlightIndex(index)}
            onChoose={() => choose(index)}
            onSubmit={() => moveTo(target)}
          />
        ))}
      </ul>

      {trimmedQuery && targets.length === 0 && (
        <p className="px-3 py-6 text-center text-[13px] text-muted-foreground">
          No other folder matches “{trimmedQuery}”.
        </p>
      )}

      {!hasOtherFolders && !trimmedQuery && (
        <div
          className={cn(
            "flex flex-col items-center rounded-xl border border-dashed border-border bg-sunken/50 px-6 py-6 text-center",
            targets.length > 0 && "mt-2",
          )}
        >
          <span className="grid size-10 place-items-center rounded-full bg-popover text-primary-text shadow-sm ring-1 ring-border">
            <FolderSearch className="size-5" />
          </span>
          <p className="mt-3 text-[13.5px] font-semibold text-ink">No other folders yet</p>
          <p className="mt-1 max-w-[18rem] text-[12.5px] leading-5 text-muted-foreground">
            Type a name above to create a folder and move this agent into it.
          </p>
        </div>
      )}

      <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd>
          choose
        </span>
        <span className="flex items-center gap-1">
          <Kbd>↵</Kbd>
          move
        </span>
        <span className="flex items-center gap-1">
          <Kbd>esc</Kbd>
          close
        </span>
      </div>
    </CardDialog>
  );
};
