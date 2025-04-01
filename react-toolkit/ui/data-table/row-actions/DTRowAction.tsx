import { useDTCrudDialogStore } from "@/react-toolkit/stores/dt-crud-dialog-store";
import {
  ArrowUpRightIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import React from "react";
import { useShallow } from "zustand/react/shallow";
import { SimpleDDMenuItem } from "@/react-toolkit/ui/dropdown-menu/SimpleDDMenuItem";
import { useLocation, useNavigate } from "react-router-dom";

interface DTEditRowActionProps {
  rowId: string;
  size?: "sm" | "md";
  crudAction: "update" | "read";
}

/**
 * Represents a row action (Edit or View) dropdown item component for a data table.
 * This component renders a dropdown menu item for editing or viewing a row.
 */
export const DTRowAction: React.FC<DTEditRowActionProps> = ({
  rowId,
  crudAction,
  size = "md",
}) => {
  const navigate = useNavigate();
  const location = useLocation();

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
        navigate({
          pathname: location?.pathname,
        });
        console.log(location);
        setCrudDialogOptions({
          showDialog: true,
          rowId,
          crudAction: crudAction,
        });
      }}
    />
  );
};
