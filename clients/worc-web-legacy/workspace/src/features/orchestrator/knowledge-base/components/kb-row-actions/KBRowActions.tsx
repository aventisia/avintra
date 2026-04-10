import { DataTableRowActions } from "@aventisia/ui/data-table";
import {
  DropdownMenuSeparator,
  SimpleDDMenuItem,
} from "@aventisia/ui/dropdown-menu";
import {
  ArrowTopRightOnSquareIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { useKBCrudDialogStore } from "../../stores/kb-crud-dialog-store";
import { KBRowDeleteAction } from "./KBRowDeleteAction";

interface KBRowActionsProps {
  rowId: string;
}

export const KBRowActions = ({ rowId }: KBRowActionsProps) => {
  const { setRowId, setAction, setShowDialog } = useKBCrudDialogStore(
    useShallow((state) => ({
      setRowId: state.setRowId,
      setAction: state.setAction,
      setShowDialog: state.setShowDialog,
    })),
  );
  const navigate = useNavigate();

  return (
    // Dropdown menu for config table row action */}
    <DataTableRowActions>
      <SimpleDDMenuItem
        Icon={ArrowTopRightOnSquareIcon}
        onClick={() => {
          navigate(rowId);
        }}
        content="Open"
      />
      <SimpleDDMenuItem
        Icon={PencilSquareIcon}
        onClick={() => {
          setShowDialog(true);
          setRowId(rowId);
          setAction("update");
        }}
        content="Edit"
      />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers Config delete alert dialog  */}
      <KBRowDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
