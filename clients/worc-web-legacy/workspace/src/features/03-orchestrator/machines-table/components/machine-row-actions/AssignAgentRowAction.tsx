import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { BotIcon } from "lucide-react";
import React from "react";
import { useShallow } from "zustand/react/shallow";

import { useAssignAgentsStore } from "../../stores/assign-agents-store";

interface DTEditRowActionProps {
  rowId: string;
  osID: string;
  size?: "sm" | "md";
}

export const AssignAgentRowAction: React.FC<DTEditRowActionProps> = ({
  rowId,
  osID,
  size = "md",
}) => {
  const { setOpen, setMachineId, setOsID } = useAssignAgentsStore(
    useShallow((s) => ({
      setOpen: s.setShowDialog,
      setMachineId: s.setMachineId,
      setOsID: s.setOsID,
    })),
  );

  // Return the Edit or View dropdown menu item
  return (
    <SimpleDDMenuItem
      size={size}
      className=""
      content="Agents"
      Icon={BotIcon}
      onClick={() => {
        setMachineId(rowId);
        setOsID(osID);
        setOpen(true);
      }}
    />
  );
};
