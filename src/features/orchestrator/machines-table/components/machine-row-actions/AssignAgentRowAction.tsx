import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { BotIcon } from "lucide-react";
import React from "react";
import { useShallow } from "zustand/react/shallow";

import { useAssignAgentsStore } from "../../stores/assign-agents-store";

interface DTEditRowActionProps {
  rowId: string;
  osId: string;
  size?: "sm" | "md";
}

export const AssignAgentRowAction: React.FC<DTEditRowActionProps> = ({
  rowId,
  osId,
  size = "md",
}) => {
  const { setOpen, setMachineId, setOsId } = useAssignAgentsStore(
    useShallow((s) => ({
      setOpen: s.setShowDialog,
      setMachineId: s.setMachineId,
      setOsId: s.setOsId,
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
        setOsId(osId);
        setOpen(true);
      }}
    />
  );
};
