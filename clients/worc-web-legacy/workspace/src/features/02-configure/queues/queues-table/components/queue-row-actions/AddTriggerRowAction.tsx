import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { ZapIcon } from "lucide-react";
import React from "react";

interface AddTriggerRowActionProps {
  rowId: string;
  size?: "sm" | "md";
}

export const AddTriggerRowAction: React.FC<AddTriggerRowActionProps> = ({
  size = "md",
}) => {
  return <SimpleDDMenuItem size={size} content="Add Trigger" Icon={ZapIcon} />;
};
