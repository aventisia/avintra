import { ArrowUpRightIcon, NotePencilIcon } from "@phosphor-icons/react";
import React from "react";

import { SimpleDDMenuItem } from "@/ui/components/dropdown-menu";
import { type CrudEntityKey } from "@/ui/types";

import { useCrudDialogUrlState } from "./useCrudDialogUrlState";

interface CrudRowActionProps {
  rowId: string;
  size?: "sm" | "md";
  crudAction: "update" | "read";
  entity: CrudEntityKey;
  /** Whether the action is disabled (e.g. for immutable records). */
  disabled?: boolean;
}

export const CrudRowAction: React.FC<CrudRowActionProps> = ({
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
      Icon={crudAction === "read" ? ArrowUpRightIcon : NotePencilIcon}
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
