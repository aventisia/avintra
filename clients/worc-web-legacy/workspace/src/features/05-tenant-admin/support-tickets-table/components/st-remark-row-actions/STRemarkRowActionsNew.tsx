import { DataTableRowActions } from "@aventisia/ui/data-table";
import { DropdownMenuSeparator } from "@aventisia/ui/dropdown-menu";

import { DTRemarkEditAction } from "./DTRemarkEditAction";
import { STRemarkDeleteActionNew } from "./STRemarkDeleteActionNew";

interface STRemarkRowActionsNewProps {
  rowId: string;
  setEditingCommentId: (id: string | null) => void;
  onDelete: () => void;
  onEdit: () => void;
}

export const STRemarkRowActionsNew = ({
  rowId,
  setEditingCommentId,
  onDelete,
  onEdit,
}: STRemarkRowActionsNewProps) => {
  return (
    <DataTableRowActions>
      <DTRemarkEditAction
        rowId={rowId}
        crudAction="update"
        setEditingCommentId={setEditingCommentId}
        onEdit={onEdit}
      />

      <DropdownMenuSeparator />

      <STRemarkDeleteActionNew rowId={rowId} onDelete={onDelete} />
    </DataTableRowActions>
  );
};
