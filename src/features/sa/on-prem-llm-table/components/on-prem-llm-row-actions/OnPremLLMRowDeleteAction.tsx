import { buttonVariants } from "@aventisia/ui/buttons";
import { DropdownMenuItem } from "@aventisia/ui/dropdown-menu";
import {
  useListOptimisticMutation,
  useShowAlertHandler,
} from "@aventisia/ui/hooks";
import { cn } from "@aventisia/ui/lib";
import { TrashIcon } from "@heroicons/react/24/outline";

import { onPremLLMOptimisticMutationFn } from "../../apis/on-prem-llm-table-apis";
import { ONPREM_LLM_QUERY_KEY } from "../../constants";
import { OnPremLLMTableDTO } from "../../dtos/on-prem-llm-table-dto";

interface OnPremLLMRowDeleteActionProps {
  rowId: string;
}

export const OnPremLLMRowDeleteAction = ({
  rowId,
}: OnPremLLMRowDeleteActionProps) => {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get mutation function to delete the model
  const { mutate: deleteModel } = useListOptimisticMutation<
    string,
    OnPremLLMTableDTO | boolean,
    OnPremLLMTableDTO
  >([rowId], onPremLLMOptimisticMutationFn, ONPREM_LLM_QUERY_KEY);

  // Return Delete alert dialog trigger
  return (
    <DropdownMenuItem
      className={cn(
        buttonVariants({ variant: "dropdownCautionItem" }),
        "group h-8",
      )}
      onClick={() => {
        showDefaultAlertDialog({
          confirmActionFn: () =>
            deleteModel({
              payload: rowId,
              crudAction: "delete",
            }),
          alertType: "delete-record",
          additionalText: "LLM",
        });
      }}
    >
      <TrashIcon
        className={cn(
          "mb-[2px] text-destructive group-focus:text-white",
          "h-4 w-4",
        )}
      />
      Uninstall
    </DropdownMenuItem>
  );
};
