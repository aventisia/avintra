import { SimpleDDMenuItem } from "@/react-toolkit/ui/dropdown-menu/SimpleDDMenuItem";

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
