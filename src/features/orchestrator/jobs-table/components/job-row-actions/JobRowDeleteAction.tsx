import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { DeleteDDMenuItem } from "@/react-toolkit/ui/dropdown-menu/DeleteDDMenuItem";
import { DATA_QUERY_KEY } from "../../constants";
import { JobsTableDto } from "../../dtos/jobs-table-dto";
import { JobOptimisticMutationFn } from "../../apis/jobs-table-apis";

interface JobRowDeleteActionProps {
  rowId: string;
}

export const JobRowDeleteAction = ({ rowId }: JobRowDeleteActionProps) => {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get mutation function to delete the queue
  const { mutate: deleteJob } = useListOptimisticMutation<
    string,
    JobsTableDto | boolean,
    JobsTableDto
  >([rowId], JobOptimisticMutationFn, DATA_QUERY_KEY);

  // Return Delete alert dialog trigger
  return (
    <DeleteDDMenuItem
      onClick={() => {
        showDefaultAlertDialog({
          confirmActionFn: () =>
            deleteJob({
              payload: rowId,
              crudAction: "delete",
            }),
          alertType: "delete-record",
          additionalText: "queue",
        });
      }}
    />
  );
};
