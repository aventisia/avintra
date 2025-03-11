import { useOptimisticMutation } from "@/react-toolkit/hooks/useOptimisticMutation";
import { SimpleDDMenuItem } from "@/react-toolkit/ui/dropdown-menu/SimpleDDMenuItem";
import { DATA_QUERY_KEY } from "../../constants";
import { retryJob } from "../../apis/jobs-table-apis";

interface JobRowRetryActionProps {
  id: string;
  name?: string;
}

export const JobRowRetryAction = ({ id }: JobRowRetryActionProps) => {
  // Use optimistic mutation to retry the failed job .
  const { mutate, isPending } = useOptimisticMutation<string, boolean, string>(
    retryJob,
    DATA_QUERY_KEY,
    [id],
  );

  // Return retry alert dialog trigger
  return (
    <SimpleDDMenuItem
      content="Retry"
      lucidIconName="RotateCw"
      className="fonr stroke-2"
      disabled={isPending}
      onClick={() => mutate(id)}
    />
  );
};
