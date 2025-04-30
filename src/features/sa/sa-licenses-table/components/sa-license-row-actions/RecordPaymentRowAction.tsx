import { useDTCrudDialogStore } from "@/react-toolkit/stores/dt-crud-dialog-store";
import { SimpleDDMenuItem } from "@/react-toolkit/ui/dropdown-menu/SimpleDDMenuItem";

import React from "react";
import { MdAddTask } from "react-icons/md";
import { useShallow } from "zustand/react/shallow";

interface DTEditRowActionProps {
  rowId: string;
  size?: "sm" | "md";
}

/**
 * Represents a row action (Edit or View) dropdown item component for a data table.
 * This component renders a dropdown menu item for editing or viewing a row.
 */
export const RecordPaymentRowAction: React.FC<DTEditRowActionProps> = ({
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
      content="Record Payment"
      Icon={MdAddTask}
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
