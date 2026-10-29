import { buttonVariants } from "@avplatform/ui/buttons";
import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { useShowAlertHandler } from "@avplatform/ui/hooks";
import { cn } from "@avplatform/ui/lib";
import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserMinus2Icon } from "lucide-react";
import React from "react";

import { removeResourceUserAccess } from "../../apis/resource-user-access.apis";

interface RemoveResourceRowActionProps {
  rowId: string;
  queryKey: unknown[];
}

export const RemoveResourceRowAction: React.FC<RemoveResourceRowActionProps> = ({
  rowId,
  queryKey,
}) => {
  const queryClient = useQueryClient();
  // Get showAlert handler
  const { showCustomAlertDialog } = useShowAlertHandler();

  const { mutate } = useMutation({
    mutationFn: removeResourceUserAccess,
    onSuccess: (res) => {
      if (res?.message) toast.success(res?.message);
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Return the dropdown menu item
  return (
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
      onClick={() => {
        showCustomAlertDialog({
          confirmActionFn: () => mutate(rowId),
          confirmBtnText: "Remove",
          title: "Remove access",
          description: "Remove the access to shared resource",
        });
      }}
    />
  );
};
