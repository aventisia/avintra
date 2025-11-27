import { LoadingSpinner } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { Tooltip } from "@aventisia/ui/tooltip";
import { PlayIcon, StopIcon } from "@heroicons/react/24/solid";

import { useCreateJobMutation } from "@/features/orchestrator/agents-table/hooks/useCreateJobMutation";

type ExecutionActionProps = {
  rowId: string;
  isDisabled: boolean;
  executionState: string;
};

export const ExecutionAction = ({
  rowId,
  isDisabled,
  executionState,
}: ExecutionActionProps) => {
  const machineId = "";
  const { createJobMutation, isPending } = useCreateJobMutation();

  return (
    <div className="flex items-center gap-2">
      {executionState === "executing" ? (
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
            disabled={isDisabled}
            onClick={() => {
              createJobMutation({
                flowVersionId: rowId,
                machineId: machineId,
              });
            }}
          >
            {isPending ? (
              <LoadingSpinner className="h-[1rem] w-[1rem] animate-spin text-primary" />
            ) : (
              <>
                <PlayIcon className="h-[1.125rem] w-[1.125rem] text-green-500/80" />
              </>
            )}
          </Button>
        </Tooltip>
      )}
    </div>
  );
};
