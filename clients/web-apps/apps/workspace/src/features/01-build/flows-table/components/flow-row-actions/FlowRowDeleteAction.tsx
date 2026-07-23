import { DeleteDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { useListOptimisticMutation, useShowAlertHandler } from "@avplatform/ui/hooks";

import { flowOptimisticMutationFn } from "../../apis/flows-table-apis";
import { FlowsTableDto } from "../../dtos/flows-table-dto";
import { useTableTab } from "../../hooks/useTableTab";

interface FlowRowDeleteActionProps {
  rowId: string;
}

export const FlowRowDeleteAction = ({ rowId }: FlowRowDeleteActionProps) => {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Use this in place FLOWS_QUERY_KEY to handle Personal/Shared tabs list
  const { queryKey } = useTableTab();

  // Get mutation function to delete the flow
  const { mutate: deleteFlow } = useListOptimisticMutation<
    string,
    FlowsTableDto | boolean,
    FlowsTableDto
  >([rowId], flowOptimisticMutationFn, queryKey);

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
