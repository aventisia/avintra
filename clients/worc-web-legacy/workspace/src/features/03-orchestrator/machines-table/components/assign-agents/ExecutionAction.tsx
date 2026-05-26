import { useCreateJobMutation } from "@/features/03-orchestrator/agents-table/hooks/useCreateJobMutation";
import { useAbortJobExecutionMutation } from "@/features/execute-flow/hooks/useAbortJobExecutionMutation";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";

import { LoadingSpinner } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { toast } from "@aventisia/ui/sonner";
import { Tooltip } from "@aventisia/ui/tooltip";
import { PlayIcon, StopIcon } from "@heroicons/react/24/solid";
import { useShallow } from "zustand/react/shallow";

import { useAssignAgentsStore } from "../../stores/assign-agents-store";

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
  const { machineId } = useAssignAgentsStore(
    useShallow((s) => ({
      machineId: s.machineId,
    })),
  );

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
            size="icon7"
            onClick={() => {
              if (jobId) abortJobMutation(jobId);
            }}
            className="hover:bg-slate-200"
          >
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
              // Check plan for enterprise
              if (isEnterprise && !hasActivePlan) {
                // Show toast notification for inactive plan
                toast.error(
                  "This action is currently unavailable. Please contact your administrator or support.",
                );
                return;
              }

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
