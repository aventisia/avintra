import { DataTableRowActions } from "@aventisia/ui/data-table";
import { DropdownMenuSeparator } from "@aventisia/ui/dropdown-menu";

import { DTRemarkEditAction } from "./DTRemarkEditAction";
import { STRemarkDeleteAction } from "./STRemarkDeleteAction";

interface STRemarkRowActionsProps {
  rowId: string;
  setEditingCommentId: (id: string | null) => void;
  remarkCount: number;
  setRemarkCount: (count: number) => void;
  onDelete: (id: string) => void;
  onEdit: () => void;
}

export const STRemarkRowActions = ({
  rowId,
  setEditingCommentId,
  remarkCount,
  setRemarkCount,
  onDelete,
  onEdit,
}: STRemarkRowActionsProps) => {
  return (
    <DataTableRowActions>
      <DTRemarkEditAction
        rowId={rowId}
        crudAction="update"
        setEditingCommentId={setEditingCommentId}
        onEdit={onEdit}
      />

      <DropdownMenuSeparator />

      <STRemarkDeleteAction
        rowId={rowId}
        remarkCount={remarkCount}
        setRemarkCount={setRemarkCount}
        onDelete={() => onDelete(rowId)}
      />
    </DataTableRowActions>
  );
};
