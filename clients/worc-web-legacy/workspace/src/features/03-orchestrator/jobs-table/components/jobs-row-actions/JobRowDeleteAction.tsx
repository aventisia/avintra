import { DeleteDDMenuItem } from "@aventisia/ui/dropdown-menu";
import {
  useListOptimisticMutation,
  useShowAlertHandler,
} from "@aventisia/ui/hooks";

import {
  DATA_QUERY_KEY,
  JobsTableRowDto,
  jobOptimisticMutationFn,
} from "../..";

interface JobRowDeleteActionProps {
  rowId: string;
}

export const JobRowDeleteAction = ({ rowId }: JobRowDeleteActionProps) => {
  const { mutate: deleteJob } = useListOptimisticMutation<
    string,
    JobsTableRowDto | boolean,
    JobsTableRowDto
  >([rowId], jobOptimisticMutationFn, DATA_QUERY_KEY);

  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

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
          additionalText: "job",
        });
      }}
    />
  );
};
