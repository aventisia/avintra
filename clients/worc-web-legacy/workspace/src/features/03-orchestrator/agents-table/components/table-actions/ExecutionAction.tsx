import { LoadingSpinner } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { toast } from "@aventisia/ui/sonner";
import { Tooltip } from "@aventisia/ui/tooltip";
import { PlayIcon, StopIcon } from "@heroicons/react/24/solid";
import { useShallow } from "zustand/react/shallow";

import { useCreateJobMutation } from "@/features/03-orchestrator/agents-table/hooks/useCreateJobMutation";
import { useAbortJobExecutionMutation } from "@/features/execute-flow/hooks/useAbortJobExecutionMutation";
import { MachineStatusEnum } from "@/react-toolkit/enums/machine-status-enum";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";

import { useAssignMachineStore } from "../../stores/assign-machine-store";

type ExecutionActionProps = {
  rowId: string;
  isDisabled?: boolean;
  jobId?: string;
  executionState: MachineStatusEnum;
};

export const ExecutionAction = ({ rowId, executionState, jobId }: ExecutionActionProps) => {
  const { flowVersionId } = useAssignMachineStore(
    useShallow((s) => ({
      flowVersionId: s.flowVersionId,
      setMachineIds: s.setMachineIds,
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
      {executionState === "Running" ? (
        <Tooltip content="Abort">
          <Button
            variant="ghost"
            size="icon7"
            className="hover:bg-slate-200"
            onClick={() => {
              if (jobId) abortJobMutation(jobId);
            }}
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
                flowVersionId: flowVersionId,
                machineId: rowId,
              });
            }}
          >
            {isPending ? (
              <LoadingSpinner className="h-[1rem] w-[1rem] animate-spin text-primary" />
            ) : (
              <>
                <PlayIcon className={cn("h-[1.125rem] w-[1.125rem] text-green-500/80")} />
              </>
            )}
          </Button>
        </Tooltip>
      )}
    </div>
  );
};
