import { flowOptimisticMutationFn } from "@/features/flows-popover/apis/flows-table-apis";
import { FlowsTableDto } from "@/features/flows-popover/dtos/flows-table-dto";
import { useListOptimisticMutation } from "@avplatform/ui/hooks";
import { useShowAlertHandler } from "@avplatform/ui/hooks";
import { DeleteDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { FLOWS_QUERY_KEY } from "../../constants/constants";

interface FLIDeleteActionProps {
  flowId: string;
}

/**
 * Renders the delete action for a flow list item.
 * This component displays a dropdown menu item with a delete button.
 */
export const FLIDeleteAction = ({ flowId }: FLIDeleteActionProps) => {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get mutation function to delete the flow
  const { mutate: deleteFlow } = useListOptimisticMutation<
    string,
    FlowsTableDto | boolean,
    FlowsTableDto
  >([flowId], flowOptimisticMutationFn, FLOWS_QUERY_KEY);

  // Return Delete alert dialog trigger
  return (
    <DeleteDDMenuItem
      size="sm"
      onClick={() => {
        showDefaultAlertDialog({
          confirmActionFn: () =>
            deleteFlow({
              payload: flowId,
              crudAction: "delete",
            }),
          alertType: "delete-record",
          additionalText: "flow",
        });
      }}
    />
  );
};
