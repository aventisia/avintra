import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { cn } from "@/react-toolkit/lib/utils";
import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";
import { DropdownMenuItem } from "@/react-toolkit/ui/dropdown-menu";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useShallow } from "zustand/react/shallow";
import { flowOptimisticMutationFn } from "../apis/flows-table-apis";
import { FlowsTableDto } from "../dtos/flows-table-dto";
import { useFlowsTableStore } from "../stores/flows-table-store";

interface DeleteActionProps {
  flowId: string;
}

/**
 * Renders the delete action for a flow row item.
 * This component displays a dropdown menu item with a delete button.
 */
export const FlowDeleteRowAction = ({ flowId }: DeleteActionProps) => {
  // Get showAlert handler
  const { showAlertDialog } = useShowAlertHandler();

  // Get flows store state and actions
  const { flowsQueryKey } = useFlowsTableStore(
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
        "group h-8",
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
      <TrashIcon className="mb-[2px] h-4 w-4 text-destructive group-focus:text-white" />
      Delete
    </DropdownMenuItem>
  );
};
