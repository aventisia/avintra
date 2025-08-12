import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { BotIcon } from "lucide-react";
import React from "react";
import { useShallow } from "zustand/react/shallow";

import { useAssignAgentsStore } from "../../stores/assign-agents-store";

interface DTEditRowActionProps {
  rowId: string;
  size?: "sm" | "md";
}

export const AssignAgentRowAction: React.FC<DTEditRowActionProps> = ({
  rowId,
  size = "md",
}) => {
  const { setOpen, setMachineId } = useAssignAgentsStore(
    useShallow((s) => ({
      setOpen: s.setShowDialog,
      setMachineId: s.setMachineId,
    })),
  );

  // Return the Edit or View dropdown menu item
  return (
    <SimpleDDMenuItem
      size={size}
      className=""
      content="Assign Agent"
      Icon={BotIcon}
      onClick={() => {
        setMachineId(rowId);
        setOpen(true);
      }}
    />
  );
};
