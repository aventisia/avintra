import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { ArrowUpRightIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import React from "react";

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
  // Return the Edit or View dropdown menu item
  return (
    <SimpleDDMenuItem
      size={size}
      content={crudAction === "read" ? "View" : "Edit"}
      Icon={crudAction === "read" ? ArrowUpRightIcon : PencilSquareIcon}
      onClick={() => {
        setEditingCommentId(rowId);
        if (crudAction === "update") {
          onEdit();
        }
      }}
    />
  );
};
