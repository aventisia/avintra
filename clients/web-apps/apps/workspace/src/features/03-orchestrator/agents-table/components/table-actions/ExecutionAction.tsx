import { Button } from "@avplatform/ui/buttons";
import { useCrudDialogUrlState } from "@avplatform/ui/data-table";
import { MachineStatusEnum } from "@avplatform/ui/enums/machine-status-enum";
import { Tooltip } from "@avplatform/ui/tooltip";
import { PlayIcon, SquareIcon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useAbortJobExecutionMutation } from "@/features/execute-flow/hooks/useAbortJobExecutionMutation";

import { useAssignMachineStore } from "../../stores/assign-machine-store";

type ExecutionActionProps = {
  rowId: string;
  machineName: string;
  isDisabled?: boolean;
  jobId?: string;
  executionState: MachineStatusEnum;
};

export const ExecutionAction = ({
  rowId,
  machineName,
  executionState,
  jobId,
}: ExecutionActionProps) => {
  const { flowVersionId, flowName, flowVersionNumber, supportedPlatform } = useAssignMachineStore(
    useShallow((s) => ({
      flowVersionId: s.flowVersionId,
      flowName: s.flowName,
      flowVersionNumber: s.flowVersionNumber,
      supportedPlatform: s.supportedPlatform,
    })),
  );

  const { openCrudDialog } = useCrudDialogUrlState();

  const { abortJobMutation } = useAbortJobExecutionMutation();

  // Open the create job form pre-filled with this machine and flow version.
  const handleCreateJob = () => {
    openCrudDialog({
      entity: "job",
      crudAction: "create",
      rowId: window.crypto.randomUUID(),
      extraParams: {
        mid: `${rowId}||${machineName}`,
        fv: `${flowVersionId}||${flowName} v${flowVersionNumber}`,
        ...(supportedPlatform ? { fvp: supportedPlatform } : {}),
      },
    });
  };

  return (
    <div className="flex items-center gap-2">
      {executionState === "Running" ? (
        <Tooltip content="Abort">
          <Button
            variant="ghost"
            size="icon7"
            className="hover:bg-hover"
            onClick={() => {
              if (jobId) abortJobMutation(jobId);
            }}
          >
            <SquareIcon className="h-[1.125rem] w-[1.125rem] text-bad" />
          </Button>
        </Tooltip>
      ) : (
        <Tooltip content="Execute">
          <Button variant="ghost" size="icon7" className="hover:bg-hover" onClick={handleCreateJob}>
            <PlayIcon className="h-[1.125rem] w-[1.125rem] text-ok" />
          </Button>
        </Tooltip>
      )}
    </div>
  );
};
