import { LoadingSpinner } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { Tooltip } from "@aventisia/ui/tooltip";
import { PlayIcon, StopIcon } from "@heroicons/react/24/solid";
import { useShallow } from "zustand/react/shallow";

import { useCreateJobMutation } from "@/features/orchestrator/agents-table/hooks/useCreateJobMutation";
import { MachineStatusTypesEnum } from "@/react-toolkit/enums/machine-status-types-enum";

import { useAssignMachineStore } from "../../stores/assign-machine-store";

type ExecutionActionProps = {
  rowId: string;
  isDisabled?: boolean;
  executionState: MachineStatusTypesEnum;
};

export const ExecutionAction = ({
  rowId,
  executionState,
}: ExecutionActionProps) => {
  const { flowVersionId } = useAssignMachineStore(
    useShallow((s) => ({
      flowVersionId: s.flowVersionId,
      setMachineIds: s.setMachineIds,
    })),
  );

  const { createJobMutation, isPending } = useCreateJobMutation();

  return (
    <div className="flex items-center gap-2">
      {executionState === "Running" ? (
        <Tooltip content="Abort">
          <Button variant="ghost" size="icon7" className="hover:bg-slate-200">
            <StopIcon className="h-[1.125rem] w-[1.125rem] text-red-500/80" />
          </Button>
        </Tooltip>
      ) : (
        <Tooltip content="Execute">
          <Button
            variant="ghost"
            size="icon7"
            className="hover:bg-slate-200"
            disabled={executionState === "Offline"}
            onClick={() => {
              createJobMutation({
                flowVersionId: flowVersionId,
                machineId: rowId,
              });
            }}
          >
            {isPending ? (
              <LoadingSpinner className="h-[1rem] w-[1rem] animate-spin text-primary" />
            ) : (
              <>
                <PlayIcon
                  className={cn(
                    "h-[1.125rem] w-[1.125rem] text-green-500/80",
                    executionState === "Offline" && "text-gray-400",
                  )}
                />
              </>
            )}
          </Button>
        </Tooltip>
      )}
    </div>
  );
};
