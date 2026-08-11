import { LoadingSpinner } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { toast } from "@avplatform/ui/sonner";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { Tooltip } from "@avplatform/ui/tooltip";
import { PlayIcon, StopIcon } from "@heroicons/react/24/solid";
import { useShallow } from "zustand/react/shallow";

import { DUMMY_MACHINE_ID } from "@/constants/machine-identity";
import { useCreateJobMutation } from "@/features/03-orchestrator/agents-table/hooks/useCreateJobMutation";
import { useAbortJobExecutionMutation } from "@/features/execute-flow/hooks/useAbortJobExecutionMutation";

type ExecutionActionProps = {
  rowId: string;
  isDisabled: boolean;
  executionState: string;

  jobId?: string;
};

export const ExecutionAction = ({
  rowId,
  isDisabled,
  executionState,
  jobId,
}: ExecutionActionProps) => {
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const isEnterprise = userSession?.deploymentType == "Enterprise";
  const hasActivePlan = userSession?.planType == "Active";

  const { createJobMutation, isPending } = useCreateJobMutation();

  const { abortJobMutation } = useAbortJobExecutionMutation();

  return (
    <div className="flex items-center gap-2">
      {executionState.toLowerCase() === "executing" ? (
        <Tooltip content="Abort">
          <Button
            variant="ghost"
            size="icon8"
            className="hover:bg-white/10"
            onClick={() => {
              if (jobId) abortJobMutation(jobId);
            }}
          >
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
              // Check plan for enterprise
              if (isEnterprise && !hasActivePlan) {
                // Show toast notification for inactive plan
                toast.error(
                  "This action is currently unavailable. Please contact your administrator or support.",
                );
                return;
              }

              createJobMutation({ flowVersionId: rowId, osId: DUMMY_MACHINE_ID });
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
