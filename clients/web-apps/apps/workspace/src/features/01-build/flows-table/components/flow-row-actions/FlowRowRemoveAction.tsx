import { buttonVariants } from "@avplatform/ui/buttons";
import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { useShowAlertHandler } from "@avplatform/ui/hooks";
import { cn } from "@avplatform/ui/lib";
import { TrashIcon } from "@phosphor-icons/react";

import { useRemoveFlowAccessMutation } from "../../hooks/useRemoveFlowAccessMutation";

interface FlowRowRemoveActionProps {
  rowId: string;
}

export const FlowRowRemoveAction = ({ rowId }: FlowRowRemoveActionProps) => {
  // Get showAlert handler
  const { showCustomAlertDialog } = useShowAlertHandler();

  const { mutate: removeFlow } = useRemoveFlowAccessMutation();

  // Return Remove alert dialog trigger
  return (
    <>
      <SimpleDDMenuItem
        children={
          <>
            <TrashIcon className="h-4 w-4 text-bad" /> <>Remove</>
          </>
        }
        className={cn(
          buttonVariants({
            variant: "dropdownCautionItem",
            size: "sm",
          }),
          "group h-8",
        )}
        // Icon={Trash2Icon}
        onClick={() => {
          showCustomAlertDialog({
            confirmActionFn: () => removeFlow(rowId),
            confirmBtnText: "Remove",
            title: "Remove access",
            description: "Remove the shared flow access",
          });
        }}
      />
    </>
  );
};
