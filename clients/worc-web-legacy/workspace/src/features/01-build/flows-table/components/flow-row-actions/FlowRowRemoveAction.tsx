import { buttonVariants } from "@aventisia/ui/buttons";
import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { useShowAlertHandler } from "@aventisia/ui/hooks";
import { cn } from "@aventisia/ui/lib";
import { UserMinus2Icon } from "lucide-react";

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
            <UserMinus2Icon className={cn("", "h-4 w-4")} /> <>Remove</>
          </>
        }
        className={cn(
          buttonVariants({
            variant: "dropdownCautionItem",
            size: "sm",
          }),
          "h-8",
        )}
        // Icon={UserMinus2Icon}
        onClick={() => {
          showCustomAlertDialog({
            confirmActionFn: () => removeFlow(rowId),
            confirmBtnText: "Remove",
            title: "Remove Access",
            description: "Remove the shared flow access",
          });
        }}
      />
    </>
  );
};
