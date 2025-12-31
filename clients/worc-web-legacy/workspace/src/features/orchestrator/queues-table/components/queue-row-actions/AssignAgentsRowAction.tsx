import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { BotIcon } from "lucide-react";
import React from "react";
import { useShallow } from "zustand/react/shallow";

import { useQueueDTCrudDialogStore } from "../../stores/queue-dialog-store";

interface AssignAgentsRowActionProps {
  rowId: string;
  queueName: string;
  size?: "sm" | "md";
}

export const AssignAgentsRowAction: React.FC<AssignAgentsRowActionProps> = ({
  size = "md",
  rowId,
  queueName,
}) => {
  // Get data-table crud dialog store state and actions
  const { setCrudDialogOptions, setDialogHeading } = useQueueDTCrudDialogStore(
    useShallow((state) => ({
      setCrudDialogOptions: state.setCrudDialogOptions,
      setDialogHeading: state.setDialogHeading,
    })),
  );

  return (
    <SimpleDDMenuItem
      size={size}
      content="Assign Agents"
      Icon={BotIcon}
      onClick={() => {
        setDialogHeading(`Assign Agents : ${queueName}`);
        setCrudDialogOptions({
          crudAction: "assign-agents",
          rowId,
          showDialog: true,
        });
      }}
    />
  );
};
