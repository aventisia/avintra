import { DeleteDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { useShowAlertHandler } from "@aventisia/ui/hooks";

import { useDeleteJobMutation } from "../../hooks/useDeleteJobMutation";

interface JobRowDeleteActionProps {
  rowId: string;
}

export const JobRowDeleteAction = ({ rowId }: JobRowDeleteActionProps) => {
  const { deleteJobMutation } = useDeleteJobMutation();
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Return Delete alert dialog trigger
  return (
    <DeleteDDMenuItem
      onClick={() => {
        showDefaultAlertDialog({
          confirmActionFn: () => deleteJobMutation(rowId),
          alertType: "delete-record",
          additionalText: "job",
        });
      }}
    />
  );
};
