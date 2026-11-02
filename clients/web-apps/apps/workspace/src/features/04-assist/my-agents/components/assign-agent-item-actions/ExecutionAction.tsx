import { Button } from "@avplatform/ui/buttons";
import { useCrudDialogUrlState } from "@avplatform/ui/data-table";
import { Tooltip } from "@avplatform/ui/tooltip";
import { PlayIcon, SquareIcon } from "lucide-react";

import { useAbortJobExecutionMutation } from "@/features/execute-flow/hooks/useAbortJobExecutionMutation";

type ExecutionActionProps = {
  rowId: string;
  flowName?: string | null;
  flowVersionNumber?: number;
  supportedPlatform?: string;
  isDisabled?: boolean;
  jobId?: string;
  executionState: string;
};

export const ExecutionAction = ({
  rowId,
  flowName,
  flowVersionNumber,
  supportedPlatform,
  executionState,
  jobId,
}: ExecutionActionProps) => {
  const { openCrudDialog } = useCrudDialogUrlState();

  const { abortJobMutation } = useAbortJobExecutionMutation();

  // Open the create job form pre-filled with this flow version.
  const handleCreateJob = () => {
    openCrudDialog({
      entity: "job",
      crudAction: "create",
      rowId: window.crypto.randomUUID(),
      extraParams: {
        fv: `${rowId}||${flowName ?? "Agent"} v${flowVersionNumber ?? 0}`,
        ...(supportedPlatform ? { fvp: supportedPlatform } : {}),
      },
    });
  };

  return (
    <div className="flex items-center gap-2">
      {executionState.toLowerCase() === "running" ? (
        <Tooltip content="Abort">
          <Button
            variant="ghost"
            size="icon8"
            className="hover:bg-hover"
            onClick={() => {
              if (jobId) abortJobMutation(jobId);
            }}
          >
            <SquareIcon className="h-[1.1rem] w-[1.1rem] text-bad" />
          </Button>
        </Tooltip>
      ) : (
        <Tooltip content="Execute">
          <Button variant="ghost" size="icon8" className="hover:bg-hover" onClick={handleCreateJob}>
            <PlayIcon className="h-[1.125rem] w-[1.125rem] text-ok" />
          </Button>
        </Tooltip>
      )}
    </div>
  );
};
