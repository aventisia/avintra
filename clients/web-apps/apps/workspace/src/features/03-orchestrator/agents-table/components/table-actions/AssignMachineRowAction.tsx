import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { MonitorCheck } from "lucide-react";
import React from "react";
import { useShallow } from "zustand/react/shallow";

import { useAssignMachineStore } from "../../stores/assign-machine-store";

interface DTEditRowActionProps {
  rowId: string;
  flowName?: string | null;
  flowVersionNumber?: number;
  supportedPlatform?: string;
  size?: "sm" | "md";
  isDisabled: boolean;
}

export const AssignMachineRowAction: React.FC<DTEditRowActionProps> = ({
  rowId,
  flowName,
  flowVersionNumber,
  supportedPlatform,
  size = "md",
  isDisabled,
}) => {
  const { setOpen, setFlowVersionId, setFlowMetadata } = useAssignMachineStore(
    useShallow((s) => ({
      setOpen: s.setShowDialog,
      setFlowVersionId: s.setFlowVersionId,
      setFlowMetadata: s.setFlowMetadata,
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
        setFlowMetadata(flowName ?? "", flowVersionNumber ?? 0, supportedPlatform ?? "");
        setOpen(true);
      }}
    />
  );
};
