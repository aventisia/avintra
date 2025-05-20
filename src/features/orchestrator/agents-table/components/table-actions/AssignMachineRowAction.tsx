import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { useDTCrudDialogStore } from "@aventisia/ui/stores";
import { MonitorCheck } from "lucide-react";
import React from "react";
import { useShallow } from "zustand/react/shallow";

interface DTEditRowActionProps {
  rowId: string;
  size?: "sm" | "md";
}

export const AssignMachineRowAction: React.FC<DTEditRowActionProps> = ({
  rowId,
  size = "md",
}) => {
  // Get store state and actions
  const { setCrudDialogOptions } = useDTCrudDialogStore(
    useShallow((state) => ({
      setCrudDialogOptions: state.setCrudDialogOptions,
    })),
  );

  // Return the Edit or View dropdown menu item
  return (
    <SimpleDDMenuItem
      size={size}
      content="Assign Machine"
      Icon={MonitorCheck}
      onClick={() => {
        setCrudDialogOptions({
          showDialog: true,
          rowId,
          crudAction: "update",
        });
      }}
    />
  );
};
