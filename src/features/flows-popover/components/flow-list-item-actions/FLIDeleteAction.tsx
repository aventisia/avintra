import { flowOptimisticMutationFn } from "@/features/flows-popover/apis/flows-table-apis";
import { FlowsTableDto } from "@/features/flows-popover/dtos/flows-table-dto";
import { useFlowsPopoverStore } from "@/features/flows-popover/stores/flows-popover-store";
import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { DeleteDDMenuItem } from "@/react-toolkit/ui/drop-down/DeleteDDMenuItem";
import { useShallow } from "zustand/react/shallow";

interface FLIDeleteActionProps {
  flowId: string;
}

/**
 * Renders the delete action for a flow list item.
 * This component displays a dropdown menu item with a delete button.
 */
export const FLIDeleteAction = ({ flowId }: FLIDeleteActionProps) => {
  // Get showAlert handler
  const { showDefaultDeleteAlertDialog } = useShowAlertHandler();

  // Get flows store state and actions
  const { flowsQueryKey } = useFlowsPopoverStore(
    useShallow((state) => ({
      flowsQueryKey: state.flowsQueryKey,
    })),
  );

  // Get mutation function to delete the flow
  const { mutate: deleteFlow } = useListOptimisticMutation<
    string,
    FlowsTableDto | boolean,
    FlowsTableDto
  >(flowOptimisticMutationFn, flowsQueryKey);

  // Return Delete alert dialog trigger
  return (
    <DeleteDDMenuItem
      size="sm"
      onClick={() => {
        showDefaultDeleteAlertDialog(
          {
            confirmActionFn: () => {
              // Delete the flow
              deleteFlow({
                id: flowId,
                payload: flowId,
                crudAction: "delete",
              });
            },
          },
          "flow",
        );
      }}
    />
  );
};
