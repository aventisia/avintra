import { RemoveResourceRowAction } from "@/features/resource-share/components/common-row-actions/RemoveResourceRowAction";
import { ResourceShareRowAction } from "@/features/resource-share/components/common-row-actions/ResourceShareRowAction";
import { ResourceAccessTypeEnum } from "@/features/resource-share/enums/resource-access-type-enum";
import { ResourceTypeEnum } from "@/features/resource-share/enums/resource-type-enum";
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

import { useTableTab } from "../../hooks/useTableTab";
import { useVaultDialogStore } from "../../stores/vault-dialog-store";
import { VaultRowDeleteAction } from "./VaultRowDeleteAction";

interface VaultRowActionsProps {
  rowId: string;
  name: string;
  accessLevel?: ResourceAccessTypeEnum;
  isTenantWideAccess: boolean;
}

export const VaultRowActions = ({
  rowId,
  name,
  accessLevel = ResourceAccessTypeEnum.View,
  isTenantWideAccess,
}: VaultRowActionsProps) => {
  const { setRowId, setAction, setShowDialog } = useVaultDialogStore(
    useShallow((state) => ({
      setRowId: state.setRowId,
      setAction: state.setAction,
      setShowDialog: state.setShowDialog,
    })),
  );

  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  const { isShared, queryKey } = useTableTab();

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
          resourceType={ResourceTypeEnum.AppSecret}
          resourceName={name}
        />
      )}

      {/* DropdownMenuSeparator component */}
      {showDivider && <DropdownMenuSeparator />}

      {/* Triggers Config delete alert dialog  */}
      {actions?.delete && <VaultRowDeleteAction rowId={rowId} />}

      {isShared && (
        <RemoveResourceRowAction queryKey={queryKey} rowId={rowId} />
      )}
    </DataTableRowActions>
  );
};
