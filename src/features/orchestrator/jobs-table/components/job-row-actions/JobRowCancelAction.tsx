import { SimpleDDMenuItem } from "@/react-toolkit/ui/dropdown-menu/SimpleDDMenuItem";
import { cancelJob } from "../../apis/jobs-table-apis";
import { useOptimisticMutation } from "@/react-toolkit/hooks/useOptimisticMutation";
import { DATA_QUERY_KEY } from "../../constants";

interface JobRowCancelActionProps {
  id: string;
  name?: string;
}

export const JobRowCancelAction = ({ id }: JobRowCancelActionProps) => {
  // Use optimistic mutation to cancel the job
  const { mutate, isPending } = useOptimisticMutation<string, boolean, string>(
    cancelJob,
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
