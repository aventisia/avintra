import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { BotIcon } from "lucide-react";
import React from "react";
import { useShallow } from "zustand/react/shallow";

import { useQueueAgentsStore } from "../../stores/queue-agents-store";

interface AssignAgentsRowActionProps {
  rowId: string;
  queueName: string;
  size?: "sm" | "md";
}

export const AssignAgentsRowAction: React.FC<AssignAgentsRowActionProps> = ({
  size = "md",
  rowId,
}) => {
  const { setOpen, setQueueId } = useQueueAgentsStore(
    useShallow((s) => ({
      setOpen: s.setShowDialog,
      setQueueId: s.setQueueId,
    })),
  );

  return (
    <SimpleDDMenuItem
      size={size}
      content="Assign Agents"
      Icon={BotIcon}
      onClick={() => {
        setOpen(true);
        setQueueId(rowId);
      }}
    />
  );
};
