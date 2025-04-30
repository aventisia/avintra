import { DataTableRowActions } from "@/react-toolkit/ui/data-table/row-actions/DataTableRowActions";
import { DropdownMenuSeparator } from "@/react-toolkit/ui/dropdown-menu";

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
