import { cn } from "@avplatform/ui/lib";
import { Plus } from "lucide-react";
import { motion } from "motion/react";

import { HighlightedText } from "@/components/HighlightedText";
import { MetaLine } from "@/components/MetaLine";
import { pluralize } from "@/utils/pluralize.util";

import { MoveTarget } from "../../types/move-target.type";
import { getFolderColor } from "../../utils/folder-color.util";
import { AgentsRootMark, FolderMark } from "../folder/FolderMark";

type MoveTargetOptionProps = {
  id: string;
  target: MoveTarget;
  query: string;
  isHighlighted: boolean;
  isSelected: boolean;
  onHighlight: () => void;
  onChoose: () => void;
  onSubmit: () => void;
};

const TargetMark = ({ target }: { target: MoveTarget }) => {
  if (target.kind === "root") return <AgentsRootMark size="sm" />;
  if (target.kind === "folder") {
    return <FolderMark color={getFolderColor(target.summary.folder)} size="sm" />;
  }
  return (
    <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-dashed border-primary/30 bg-selected text-primary-text">
      <Plus className="size-4" />
    </span>
  );
};

const TargetText = ({ target, query }: { target: MoveTarget; query: string }) => {
  if (target.kind === "root") {
    return (
      <>
        <span className="block truncate text-[13px] font-medium text-ink">Agents</span>
        <span className="block truncate text-[11.5px] text-muted-foreground">
          Take it out of its folder
        </span>
      </>
    );
  }

  if (target.kind === "create") {
    return (
      <>
        <span className="block truncate text-[13px] font-medium text-primary-text">
          Create “{target.name}”
        </span>
        <span className="block truncate text-[11.5px] text-muted-foreground">
          New folder, with this agent inside
        </span>
      </>
    );
  }

  const { folder, visibleAgentCount } = target.summary;
  return (
    <>
      <span className="block truncate text-[13px] font-medium text-ink">
        <HighlightedText text={folder.name} query={query} />
      </span>
      <MetaLine
        className="text-[11.5px] text-muted-foreground"
        items={[
          visibleAgentCount > 0
            ? `${visibleAgentCount} ${pluralize(visibleAgentCount, "agent")}`
            : "Empty",
          folder.description,
        ]}
      />
    </>
  );
};

/**
 * One destination row in the Move agent list, with a radio that shows the choice.
 */
export const MoveTargetOption = ({
  id,
  target,
  query,
  isHighlighted,
  isSelected,
  onHighlight,
  onChoose,
  onSubmit,
}: MoveTargetOptionProps) => (
  <li
    id={id}
    role="option"
    aria-selected={isSelected}
    onPointerMove={onHighlight}
    onMouseDown={(event) => event.preventDefault()}
    onClick={onChoose}
    onDoubleClick={onSubmit}
    className={cn(
      "flex cursor-pointer select-none items-center gap-3 rounded-lg px-2 py-2 transition-colors",
      isHighlighted && "bg-muted",
      isSelected && "bg-selected",
    )}
  >
    <TargetMark target={target} />
    <span className="min-w-0 flex-1">
      <TargetText target={target} query={query} />
    </span>
    <span
      className={cn(
        "grid size-[18px] shrink-0 place-items-center rounded-full transition-colors duration-200",
        isSelected ? "bg-primary" : "bg-popover ring-[1.5px] ring-inset ring-line-strong",
      )}
    >
      <motion.span
        initial={false}
        animate={{ scale: isSelected ? 1 : 0 }}
        transition={{ type: "spring", bounce: 0.5, duration: 0.3 }}
        className="size-1.5 rounded-full bg-popover"
      />
    </span>
  </li>
);
