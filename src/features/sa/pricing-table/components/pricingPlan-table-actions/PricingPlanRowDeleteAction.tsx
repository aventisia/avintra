import { DeleteDDMenuItem } from "@aventisia/ui/dropdown-menu";
import {
  useListOptimisticMutation,
  useShowAlertHandler,
} from "@aventisia/ui/hooks";

import { pricingPlanOptimisticMutationFn } from "../../apis/pricingPlans-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { PricingPlansTableDto } from "../../dtos/pricingPlans-table-dto";

interface PricingPlanRowDeleteActionProps {
  rowId: string;
}

export const PricingPlanRowDeleteAction = ({
  rowId,
}: PricingPlanRowDeleteActionProps) => {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get mutation function to delete the pricingplan
  const { mutate: deletePricingPlan } = useListOptimisticMutation<
    string,
    PricingPlansTableDto | boolean,
    PricingPlansTableDto
  >([rowId], pricingPlanOptimisticMutationFn, DATA_QUERY_KEY);

  // Return Delete alert dialog trigger
  return (
    <DeleteDDMenuItem
      onClick={() => {
        showDefaultAlertDialog({
          confirmActionFn: () =>
            deletePricingPlan({
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
