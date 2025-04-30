import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { BotIcon } from "lucide-react";
import React from "react";

interface AssignAgentsRowActionProps {
  rowId: string;
  size?: "sm" | "md";
}

export const AssignAgentsRowAction: React.FC<AssignAgentsRowActionProps> = ({
  size = "md",
}) => {
  return (
    <SimpleDDMenuItem size={size} content="Assign Agents" Icon={BotIcon} />
  );
};
