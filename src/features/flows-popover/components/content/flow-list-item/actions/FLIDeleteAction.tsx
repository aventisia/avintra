import { flowOptimisticMutationFn } from "@/features/flows-popover/apis/flows-table-apis";
import { FlowsTableDto } from "@/features/flows-popover/dtos/flows-table-dto";
import { useFlowsPopoverStore } from "@/features/flows-popover/stores/flows-popover-store";
import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { cn } from "@/react-toolkit/lib/utils";
import { useShowAlertHandler } from "@/react-toolkit/ui/alert-dialog/hooks/useShowAlertHandler";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";
import { DropdownMenuItem } from "@/react-toolkit/ui/dropdown-menu";
import { TrashIcon } from "@heroicons/react/24/outline";
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
  const { showAlertDialog } = useShowAlertHandler();

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
    <DropdownMenuItem
      className={cn(
        buttonVariants({ variant: "dropdownCautionItem" }),
        "group h-7 !px-[0.3rem] text-xs",
      )}
      onClick={() => {
        showAlertDialog({
          confirmActionFn: () => {
            // Delete the flow
            deleteFlow({
              id: flowId,
              payload: flowId,
              crudAction: "delete",
            });
          },
          title: "Delete flow",
          description:
            "This action cannot be undone. Are you sure you want to delete this flow?",
          confirmBtnText: "Yes, delete flow",
        });
      }}
    >
      <TrashIcon className="mb-[2px] h-3.5 w-3.5 text-destructive group-focus:text-white" />
      Delete
    </DropdownMenuItem>
  );
};
