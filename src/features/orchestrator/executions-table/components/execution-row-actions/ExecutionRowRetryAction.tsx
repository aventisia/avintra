import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { useOptimisticMutation } from "@aventisia/ui/hooks";

import { retryExecution } from "../../apis/executions-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { RotateCwIcon } from "lucide-react";

interface ExecutionRowRetryActionProps {
  id: string;
  name?: string;
}

export const ExecutionRowRetryAction = ({
  id,
}: ExecutionRowRetryActionProps) => {
  // Use optimistic mutation to retry the failed execution .
  const { mutate, isPending } = useOptimisticMutation<string, boolean, string>(
    retryExecution,
    DATA_QUERY_KEY,
    [id],
  );

  // Return retry alert dialog trigger
  return (
    <SimpleDDMenuItem
      content="Retry"
      Icon={RotateCwIcon}
      className="fonr stroke-2"
      disabled={isPending}
      onClick={() => mutate(id)}
    />
  );
};
