import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { Settings2Icon,  } from "lucide-react";
import React from "react";
import { useShallow } from "zustand/react/shallow";

import { useAgentConfigStore } from "../../stores/agent-config-store";

interface AgentConfigRowActionProps {
  rowId: string;
  size?: "sm" | "md";
  isDisabled: boolean;
}

export const AgentConfigRowAction: React.FC<AgentConfigRowActionProps> = ({
  rowId,
  size = "md",
  isDisabled,
}) => {
  const { setOpen, setFlowVersionId } = useAgentConfigStore(
    useShallow((state) => ({
      setOpen: state.setShowDialog,
      setFlowVersionId: state.setFlowVersionId,
    })),
  );
  // Return the Edit or View dropdown menu item
  return (
    <SimpleDDMenuItem
      size={size}
      disabled={isDisabled}
      content="Config"
      Icon={Settings2Icon}
      onClick={() => {
        setFlowVersionId(rowId);
        setOpen(true);
      }}
    />
  );
};
