import { LoadingSpinner } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { Tooltip } from "@aventisia/ui/tooltip";
import { PlayIcon, StopIcon } from "@heroicons/react/24/solid";
import { useShallow } from "zustand/react/shallow";

import { useCreateJobMutation } from "@/features/orchestrator/agents-table/hooks/useCreateJobMutation";
import { useTuariUserMetadataStore } from "@/stores/tuari-user-metadata-store";

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
  const { osID: machineId } = useTuariUserMetadataStore(
    useShallow((state) => ({
      osID: state.osID,
    })),
  );

  const { createJobMutation, isPending } = useCreateJobMutation();

  return (
    <div className="flex items-center gap-2">
      {executionState.toLowerCase() === "executing" ? (
        <Tooltip content="Abort">
          <Button variant="ghost" size="icon8" className="hover:bg-white/10">
            <StopIcon className="h-[1.1rem] w-[1.1rem] text-red-500/80" />
          </Button>
        </Tooltip>
      ) : (
        <Tooltip content="Execute">
          <Button
            variant="ghost"
            size="icon8"
            className="hover:bg-white/10"
            onClick={() => {
              createJobMutation({ flowVersionId: rowId, osId: machineId });
            }}
          >
            {isPending ? (
              <LoadingSpinner className="h-[1rem] w-[1rem] animate-spin text-primary" />
            ) : (
              <>
                <PlayIcon
                  className={cn(
                    "h-[1.125rem] w-[1.125rem] text-green-500/80",
                    isDisabled && "text-gray-400",
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
