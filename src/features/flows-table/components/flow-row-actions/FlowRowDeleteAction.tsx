import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { DeleteDDMenuItem } from "@/react-toolkit/ui/dropdown-menu/DeleteDDMenuItem";
import { useShallow } from "zustand/react/shallow";
import { useFlowsTableStore } from "../../stores/flows-table-store";
import { FlowsTableDto } from "../../dtos/flows-table-dto";
import { flowOptimisticMutationFn } from "../../apis/flows-table-apis";

interface FlowRowDeleteActionProps {
  rowId: string;
}

export const FlowRowDeleteAction = ({ rowId }: FlowRowDeleteActionProps) => {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

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
  >([rowId], flowOptimisticMutationFn, flowsQueryKey);

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
          additionalText: "flow",
        });
      }}
    />
  );
};
