import { useDTCrudDialogStore } from "@/react-toolkit/stores/dt-crud-dialog-store";
import React from "react";
import { useShallow } from "zustand/react/shallow";
import { SimpleDDMenuItem } from "@/react-toolkit/ui/dropdown-menu/SimpleDDMenuItem";
import { MonitorCheck } from "lucide-react";

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
