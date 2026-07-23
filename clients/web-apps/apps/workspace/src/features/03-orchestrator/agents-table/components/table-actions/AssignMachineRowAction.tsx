import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { MonitorCheck } from "lucide-react";
import React from "react";
import { useShallow } from "zustand/react/shallow";

import { useAssignMachineStore } from "../../stores/assign-machine-store";

interface DTEditRowActionProps {
  rowId: string;
  size?: "sm" | "md";
  isDisabled: boolean;
}

export const AssignMachineRowAction: React.FC<DTEditRowActionProps> = ({
  rowId,
  size = "md",
  isDisabled,
}) => {
  const { setOpen, setFlowVersionId } = useAssignMachineStore(
    useShallow((s) => ({
      setOpen: s.setShowDialog,
      setFlowVersionId: s.setFlowVersionId,
    })),
  );

  // Return the Edit or View dropdown menu item
  return (
    <SimpleDDMenuItem
      size={size}
      disabled={isDisabled}
      content="Machines"
      Icon={MonitorCheck}
      onClick={() => {
        setFlowVersionId(rowId);
        setOpen(true);
      }}
    />
  );
};
