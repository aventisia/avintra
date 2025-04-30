import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { RouteOffIcon } from "lucide-react";
import React from "react";

interface DeactivateRowActionProps {
  rowId: string;
  size?: "sm" | "md";
}

export const DeactivateRowAction: React.FC<DeactivateRowActionProps> = ({
  size = "md",
}) => {
  return (
    <SimpleDDMenuItem
      className="text-destructive"
      size={size}
      content="Deactivate"
      Icon={RouteOffIcon}
    />
  );
};
