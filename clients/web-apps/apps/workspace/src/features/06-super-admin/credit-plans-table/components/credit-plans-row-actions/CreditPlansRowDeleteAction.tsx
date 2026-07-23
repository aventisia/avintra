import { DeleteDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { useListOptimisticMutation, useShowAlertHandler } from "@avplatform/ui/hooks";

import { creditOptimisticMutationFn } from "../../apis/credit-plans-table-apis";
import { CREDIT_PLANS_QUERY_KEY } from "../../constants";
import { CreditPlansTableDto } from "../../dtos/credit-plans-table-dto";

interface ModelRowDeleteActionProps {
  rowId: string;
}

export const CreditPlansRowDeleteAction = ({ rowId }: ModelRowDeleteActionProps) => {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get mutation function to delete the model
  const { mutate: deleteModel } = useListOptimisticMutation<
    string,
    CreditPlansTableDto | boolean,
    CreditPlansTableDto
  >([rowId], creditOptimisticMutationFn, CREDIT_PLANS_QUERY_KEY);

  // Return Delete alert dialog trigger
  return (
    <DeleteDDMenuItem
      onClick={() => {
        showDefaultAlertDialog({
          confirmActionFn: () =>
            deleteModel({
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
