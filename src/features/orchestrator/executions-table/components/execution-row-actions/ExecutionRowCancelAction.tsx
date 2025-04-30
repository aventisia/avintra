import { useOptimisticMutation } from "@/react-toolkit/hooks/useOptimisticMutation";
import { SimpleDDMenuItem } from "@/react-toolkit/ui/dropdown-menu/SimpleDDMenuItem";

import { cancelExecution } from "../../apis/executions-table-apis";
import { DATA_QUERY_KEY } from "../../constants";

interface ExecutionRowCancelActionProps {
  id: string;
  name?: string;
}

export const ExecutionRowCancelAction = ({
  id,
}: ExecutionRowCancelActionProps) => {
  // Use optimistic mutation to cancel the execution
  const { mutate, isPending } = useOptimisticMutation<string, boolean, string>(
    cancelExecution,
    DATA_QUERY_KEY,
    [id],
  );

  // Return retry alert dialog trigger
  return (
    <SimpleDDMenuItem
      content="Cancel"
      lucidIconName="Ban"
      className="fonr stroke-2"
      disabled={isPending}
      onClick={() => mutate(id)}
    />
  );
};
