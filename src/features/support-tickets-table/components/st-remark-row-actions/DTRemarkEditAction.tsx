import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { useDTCrudDialogStore } from "@aventisia/ui/stores";
import {
  ArrowUpRightIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import React from "react";
import { useShallow } from "zustand/react/shallow";

interface DTRemarkEditActionProps {
  rowId: string;
  size?: "sm" | "md";
  crudAction: "update" | "read";
  setEditingCommentId: (id: string | null) => void;
  onEdit: () => void;
}

/**
 * Represents a row action (Edit or View) dropdown item component for a data table.
 * This component renders a dropdown menu item for editing or viewing a row.
 */
export const DTRemarkEditAction: React.FC<DTRemarkEditActionProps> = ({
  rowId,
  crudAction,
  size = "md",
  setEditingCommentId,
  onEdit,
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
      content={crudAction === "read" ? "View" : "Edit"}
      Icon={crudAction === "read" ? ArrowUpRightIcon : PencilSquareIcon}
      onClick={() => {
        setCrudDialogOptions({
          showDialog: false,
          rowId,
          crudAction: crudAction,
        });
        setEditingCommentId(rowId);
        if (crudAction === "update") {
          onEdit();
        }
      }}
    />
  );
};
