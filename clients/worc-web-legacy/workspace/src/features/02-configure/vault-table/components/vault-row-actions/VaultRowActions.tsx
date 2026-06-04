import { ResourceAccessTypeEnum } from "@/features/resource-share/enums/resource-access-type-enum";
import { getResourceAccessActions } from "@/features/resource-share/utils/resource-access-actions";

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
import { ResourceShareRowAction } from "./ResourceShareRowAction";
import { VaultRowDeleteAction } from "./VaultRowDeleteAction";

interface VaultRowActionsProps {
  rowId: string;
  accessLevel: ResourceAccessTypeEnum;
  isTenantWideAccess: boolean;
}

export const VaultRowActions = ({
  rowId,
  accessLevel,
  isTenantWideAccess,
}: VaultRowActionsProps) => {
  const { setRowId, setAction, setShowDialog } = useVaultDialogStore(
    useShallow((state) => ({
      setRowId: state.setRowId,
      setAction: state.setAction,
      setShowDialog: state.setShowDialog,
    })),
  );

  const actions = getResourceAccessActions(accessLevel);

  const showDivider = actions?.share || actions?.delete;

  return (
    // Dropdown menu for config table row action */}
    <DataTableRowActions className="w-36 min-w-36">
      {actions?.read && (
        <SimpleDDMenuItem
          Icon={ArrowUpRightIcon}
          onClick={() => {
            setShowDialog(true);
            setRowId(rowId);
            setAction("read");
          }}
          content="View"
        />
      )}
      {actions?.update && (
        <SimpleDDMenuItem
          Icon={PencilSquareIcon}
          onClick={() => {
            setShowDialog(true);
            setRowId(rowId);
            setAction("update");
          }}
          content="Edit"
        />
      )}

      {/* Share Access */}
      {actions?.share && (
        <ResourceShareRowAction
          rowId={rowId}
          isTenantWideAccess={isTenantWideAccess}
        />
      )}

      {/* DropdownMenuSeparator component */}
      {showDivider && <DropdownMenuSeparator />}

      {/* Triggers Config delete alert dialog  */}
      {actions?.delete && <VaultRowDeleteAction rowId={rowId} />}
    </DataTableRowActions>
  );
};
