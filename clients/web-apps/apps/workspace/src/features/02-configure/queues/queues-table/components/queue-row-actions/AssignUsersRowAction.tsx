import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { UserIcon } from "lucide-react";
import React from "react";
import { useShallow } from "zustand/react/shallow";

import { useQueueUsersStore } from "../../stores/queue-users-store";

interface AssignUsersRowActionProps {
  rowId: string;
  queueName: string;
  size?: "sm" | "md";
}

export const AssignUsersRowAction: React.FC<AssignUsersRowActionProps> = ({
  size = "md",
  rowId,
}) => {
  const { setOpen, setQueueId } = useQueueUsersStore(
    useShallow((s) => ({
      setOpen: s.setShowDialog,
      setQueueId: s.setQueueId,
    })),
  );

  return (
    <SimpleDDMenuItem
      size={size}
      content="Assign Users"
      Icon={UserIcon}
      onClick={() => {
        setOpen(true);
        setQueueId(rowId);
      }}
    />
  );
};
