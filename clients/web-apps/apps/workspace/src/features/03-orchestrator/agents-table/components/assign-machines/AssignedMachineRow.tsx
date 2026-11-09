import { Badge } from "@avplatform/ui/badge";
import { cn } from "@avplatform/ui/lib";
import { ArrowUUpLeftIcon, TrashIcon } from "@phosphor-icons/react";

import { statusVariant } from "@/features/03-orchestrator/machines-table/constants/column-display-names";

import { AssignMachineDto } from "../../dtos/assign-machine-dto";
import type {
  MachineAssignmentDraft,
  MachineChange,
} from "../../hooks/useMachineAssignmentDraft.hook";
import { ExecutionAction } from "../table-actions/ExecutionAction";
import { MachineMark } from "./MachineMark";

type AssignedMachineRowProps = {
  machine: AssignMachineDto;
  change: MachineChange;
  draft: MachineAssignmentDraft;
};

/**
 * One assigned machine with its live status, run/abort action and pending add/remove state.
 */
export const AssignedMachineRow = ({ machine, change, draft }: AssignedMachineRowProps) => {
  const isRemoved = change === "removed";

  return (
    <div
      className={cn(
        "group flex items-center gap-3 px-3.5 py-2.5 transition-colors",
        isRemoved ? "bg-sunken" : "hover:bg-hover",
      )}
    >
      <MachineMark
        os={machine.type}
        size="lg"
        className={cn("transition", isRemoved && "opacity-40 grayscale")}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            title={machine.name}
            className={cn(
              "truncate text-[13.5px] font-medium text-ink",
              isRemoved && "text-muted-foreground line-through decoration-line-strong",
            )}
          >
            {machine.name}
          </p>
          {change === "added" && <Badge className="shrink-0">New</Badge>}
          {isRemoved && (
            <Badge variant="destructive" className="shrink-0">
              Removing
            </Badge>
          )}
        </div>
        {machine.status && (
          <Badge variant={statusVariant[machine.status]} className="mt-1">
            {machine.status}
          </Badge>
        )}
      </div>
      {change === "kept" && (
        <ExecutionAction
          rowId={machine.id}
          machineName={machine.name}
          executionState={machine.status}
          jobId={machine.jobId}
        />
      )}
      {isRemoved ? (
        <button
          type="button"
          onClick={() => draft.add(machine)}
          className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md bg-surface px-2 text-[12px] font-medium text-ink-2 ring-1 ring-line-strong transition hover:text-ink"
        >
          <ArrowUUpLeftIcon className="size-3.5" />
          Undo
        </button>
      ) : (
        <button
          type="button"
          aria-label={`Remove ${machine.name}`}
          title={`Remove ${machine.name}`}
          onClick={() => draft.remove(machine.id)}
          className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground opacity-0 transition hover:bg-bad/10 hover:text-bad focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
        >
          <TrashIcon className="size-4" />
        </button>
      )}
    </div>
  );
};
