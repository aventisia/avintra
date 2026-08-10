import { ArrowUpRightIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import React from "react";

import { SimpleDDMenuItem } from "@/ui/components/dropdown-menu";
import { type CrudEntityKey } from "@/ui/types";

import { useCrudDialogUrlState } from "../useCrudDialogUrlState";

interface DTEditRowActionProps {
  rowId: string;
  size?: "sm" | "md";
  crudAction: "update" | "read";
  entity: CrudEntityKey;
  disabled?: boolean;
}

export const DTRowAction: React.FC<DTEditRowActionProps> = ({
  rowId,
  crudAction,
  size = "md",
  entity,
  disabled,
}) => {
  const { openCrudDialog } = useCrudDialogUrlState();

  return (
    <SimpleDDMenuItem
      size={size}
      content={crudAction === "read" ? "View" : "Edit"}
      Icon={crudAction === "read" ? ArrowUpRightIcon : PencilSquareIcon}
      disabled={disabled}
      onClick={() => {
        openCrudDialog({
          entity,
          crudAction: crudAction,
          rowId,
        });
      }}
    />
  );
};
