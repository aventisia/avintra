import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { UserIcon } from "lucide-react";
import React from "react";
import { useShallow } from "zustand/react/shallow";

import { useAgentUsersStore } from "../../stores/agent-users-store";

interface AssignUserRowActionProps {
  rowId: string;
  size?: "sm" | "md";
  isDisabled: boolean;
}

export const AssignUserRowAction: React.FC<AssignUserRowActionProps> = ({
  rowId,
  size = "md",
  isDisabled,
}) => {
  const { setOpen, setFlowVersionId } = useAgentUsersStore(
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
      content="Users"
      Icon={UserIcon}
      onClick={() => {
        setFlowVersionId(rowId);
        setOpen(true);
      }}
    />
  );
};
