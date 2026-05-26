import { DeleteDDMenuItem } from "@aventisia/ui/dropdown-menu";
import {
  useListOptimisticMutation,
  useShowAlertHandler,
} from "@aventisia/ui/hooks";

import { flowOptimisticMutationFn } from "../../apis/flows-table-apis";
import { FLOWS_QUERY_KEY } from "../../constants";
import { FlowsTableDto } from "../../dtos/flows-table-dto";

interface FlowRowDeleteActionProps {
  rowId: string;
}

export const FlowRowDeleteAction = ({ rowId }: FlowRowDeleteActionProps) => {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get mutation function to delete the flow
  const { mutate: deleteFlow } = useListOptimisticMutation<
    string,
    FlowsTableDto | boolean,
    FlowsTableDto
  >([rowId], flowOptimisticMutationFn, FLOWS_QUERY_KEY);

  // Return Delete alert dialog trigger
  return (
    <DeleteDDMenuItem
      onClick={() => {
        showDefaultAlertDialog({
          confirmActionFn: () =>
            deleteFlow({
              payload: rowId,
              crudAction: "delete",
            }),
          alertType: "delete-record",
          additionalText: "agent",
        });
      }}
    />
  );
};
