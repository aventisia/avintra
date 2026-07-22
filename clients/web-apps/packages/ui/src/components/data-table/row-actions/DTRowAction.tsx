import { ArrowUpRightIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import React from "react";
import { useShallow } from "zustand/react/shallow";

import { SimpleDDMenuItem } from "@/ui/components/dropdown-menu";
import { useDTCrudDialogStore } from "@/ui/stores";

import { useDataTableQueryParams } from "..";

interface DTEditRowActionProps {
  rowId: string;
  size?: "sm" | "md";
  crudAction: "update" | "read";
}

/**
 * Represents a row action (Edit or View) dropdown item component for a data table.
 * This component renders a dropdown menu item for editing or viewing a row.
 */
export const DTRowAction: React.FC<DTEditRowActionProps> = ({ rowId, crudAction, size = "md" }) => {
  // Get store state and actions
  const { setCrudDialogOptions } = useDTCrudDialogStore(
    useShallow((state) => ({
      setCrudDialogOptions: state.setCrudDialogOptions,
    })),
  );

  // Get set functions for crudAction and row id
  const { setCrudAction, setRowId } = useDataTableQueryParams();

  // Return the Edit or View dropdown menu item
  return (
    <SimpleDDMenuItem
      size={size}
      content={crudAction === "read" ? "View" : "Edit"}
      Icon={crudAction === "read" ? ArrowUpRightIcon : PencilSquareIcon}
      onClick={() => {
        // Set query param
        setCrudAction(crudAction);
        setRowId(rowId);

        // Set CRUD dialog options
        setCrudDialogOptions({
          showDialog: true,
          rowId,
          crudAction: crudAction,
        });
      }}
    />
  );
};
