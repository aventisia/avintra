import { DataTableRowActions } from "@/react-toolkit/ui/data-table/row-actions/DataTableRowActions";
import { STRemarkDeleteAction } from "./STRemarkDeleteAction";
//import { Button } from "@/react-toolkit/ui/buttons/Button";
import { DTRemarkEditAction } from "./DTRemarkEditAction";
import { DropdownMenuSeparator } from "@/react-toolkit/ui/dropdown-menu";

interface STRemarkRowActionsProps {
  rowId: string;
  setEditingCommentId: (id: string | null) => void;
  remarkCount: number;
  setRemarkCount: (count: number) => void;
}

export const STRemarkRowActions = ({
  rowId,
  setEditingCommentId,
  remarkCount,
  setRemarkCount,
}: STRemarkRowActionsProps) => {
  return (
    // Dropdown menu for support ticket remark row action */}
    <DataTableRowActions>
      {/* Edit support ticket remark message */}
      <DTRemarkEditAction
        rowId={rowId}
        crudAction="update"
        setEditingCommentId={setEditingCommentId}
      />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers Support ticket remark delete alert dialog  */}
      <STRemarkDeleteAction
        rowId={rowId}
        remarkCount={remarkCount}
        setRemarkCount={setRemarkCount}
      />
    </DataTableRowActions>
  );
};
