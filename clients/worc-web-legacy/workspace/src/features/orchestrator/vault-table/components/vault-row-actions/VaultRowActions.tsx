import { DataTableRowActions } from "@aventisia/ui/data-table";
import {
  DropdownMenuSeparator,
  SimpleDDMenuItem,
} from "@aventisia/ui/dropdown-menu";
import {
  ArrowUpRightIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { useShallow } from "zustand/react/shallow";

import { useVaultDialogStore } from "../../stores/vault-dialog-store";

import { VaultRowDeleteAction } from "./VaultRowDeleteAction";

interface VaultRowActionsProps {
  rowId: string;
}

export const VaultRowActions = ({ rowId }: VaultRowActionsProps) => {
  const { setRowId, setAction, setShowDialog } = useVaultDialogStore(
    useShallow((state) => ({
      setRowId: state.setRowId,
      setAction: state.setAction,
      setShowDialog: state.setShowDialog,
    })),
  );

  return (
    // Dropdown menu for config table row action */}
    <DataTableRowActions>
      <SimpleDDMenuItem
        Icon={ArrowUpRightIcon}
        onClick={() => {
          setShowDialog(true);
          setRowId(rowId);
          setAction("read");
        }}
        content="View"
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
      <VaultRowDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
