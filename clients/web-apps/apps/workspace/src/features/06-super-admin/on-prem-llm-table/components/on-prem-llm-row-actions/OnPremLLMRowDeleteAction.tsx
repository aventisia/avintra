import { DeleteDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { useListOptimisticMutation, useShowAlertHandler } from "@avplatform/ui/hooks";

import { onPremLLMOptimisticMutationFn } from "../../apis/on-prem-llm-table-apis";
import { ONPREM_LLM_QUERY_KEY } from "../../constants";
import { OnPremModelDto } from "../../dtos/on-prem-llm-table-dto";

interface OnPremLLMRowDeleteActionProps {
  rowId: string;
}

export const OnPremLLMRowDeleteAction = ({ rowId }: OnPremLLMRowDeleteActionProps) => {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get mutation function to delete the flow
  const { mutate: deleteFlow } = useListOptimisticMutation<
    string,
    OnPremModelDto | boolean,
    OnPremModelDto
  >([rowId], onPremLLMOptimisticMutationFn, ONPREM_LLM_QUERY_KEY);

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
          additionalText: "model",
        });
      }}
    />
  );
};
