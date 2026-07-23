import { DataTableRowActions } from "@avplatform/ui/data-table";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";

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
