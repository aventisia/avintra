import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { UserIcon } from "lucide-react";
import React from "react";

interface AssignUserRowActionProps {
  rowId: string;
  size?: "sm" | "md";
  isDisabled: boolean;
}

export const AssignUserRowAction: React.FC<AssignUserRowActionProps> = ({
  rowId,
  size = "md",
  isDisabled,
}) => {
  // Return the Edit or View dropdown menu item
  return (
    <SimpleDDMenuItem
      size={size}
      disabled={isDisabled}
      content="Users"
      Icon={UserIcon}
      onClick={() => {
        console.log(rowId);
      }}
    />
  );
};
