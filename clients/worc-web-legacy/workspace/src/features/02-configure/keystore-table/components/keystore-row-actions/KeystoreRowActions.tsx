import { ResourceAccessTypeEnum } from "@/features/resource-share/enums/resource-access-type-enum";
import { getResourceAccessActions } from "@/features/resource-share/utils/resource-access-actions";

import { DTRowAction, DataTableRowActions } from "@aventisia/ui/data-table";
import { DropdownMenuSeparator } from "@aventisia/ui/dropdown-menu";

import { KeystoreRowDeleteAction } from "./KeystoreRowDeleteAction";
import { ResourceShareRowAction } from "./ResourceShareRowAction";

interface KeystoreRowActionsProps {
  rowId: string;
  accessLevel: ResourceAccessTypeEnum;
  isTenantWideAccess: boolean;
}

export const KeystoreRowActions = ({
  rowId,
  accessLevel,
  isTenantWideAccess,
}: KeystoreRowActionsProps) => {
  const actions = getResourceAccessActions(accessLevel);

  const showDivider = actions?.share || actions?.delete;

  return (
    // Dropdown menu for keystore table row action */}
    <DataTableRowActions className="w-36 min-w-36">
      {/* View the keystore details */}
      {actions?.read && <DTRowAction rowId={rowId} crudAction="read" />}

      {/* Edit keystore details */}
      {actions?.update && <DTRowAction rowId={rowId} crudAction="update" />}

      {/* Share Access */}
      {actions?.share && (
        <ResourceShareRowAction
          rowId={rowId}
          isTenantWideAccess={isTenantWideAccess}
        />
      )}

      {/* DropdownMenuSeparator component */}
      {showDivider && <DropdownMenuSeparator />}

      {/* Triggers Keystore delete alert dialog  */}
      {actions?.delete && <KeystoreRowDeleteAction rowId={rowId} />}
    </DataTableRowActions>
  );
};
