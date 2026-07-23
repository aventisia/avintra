import { DeleteDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { useListOptimisticMutation, useShowAlertHandler } from "@avplatform/ui/hooks";

import { subPlanOptimisticMutationFn } from "../../apis/sub-plans-table-apis";
import { PLANS_QUERY_KEY } from "../../constants";
import { SubPlansTableDto } from "../../dtos/sub-plans-table-dto";

interface SubPlansRowDeleteActionProps {
  rowId: string;
}

export const SubPlansRowDeleteAction = ({ rowId }: SubPlansRowDeleteActionProps) => {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get mutation function to delete the plan
  const { mutate: deleteSubPlan } = useListOptimisticMutation<
    string,
    SubPlansTableDto | boolean,
    SubPlansTableDto
  >([rowId], subPlanOptimisticMutationFn, PLANS_QUERY_KEY);

  // Return Delete alert dialog trigger
  return (
    <DeleteDDMenuItem
      onClick={() => {
        showDefaultAlertDialog({
          confirmActionFn: () =>
            deleteSubPlan({
              payload: rowId,
              crudAction: "delete",
            }),
          alertType: "delete-record",
          additionalText: "plan",
        });
      }}
    />
  );
};
