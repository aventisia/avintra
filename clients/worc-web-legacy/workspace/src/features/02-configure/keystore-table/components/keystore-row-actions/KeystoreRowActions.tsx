import { RemoveResourceRowAction } from "@/features/resource-share/components/common-row-actions/RemoveResourceRowAction";
import { ResourceShareRowAction } from "@/features/resource-share/components/common-row-actions/ResourceShareRowAction";
import { ResourceAccessTypeEnum } from "@/features/resource-share/enums/resource-access-type-enum";
import { ResourceTypeEnum } from "@/features/resource-share/enums/resource-type-enum";
import { getResourceAccessActions } from "@/features/resource-share/utils/resource-access-actions";

import { DTRowAction, DataTableRowActions } from "@aventisia/ui/data-table";
import { DropdownMenuSeparator } from "@aventisia/ui/dropdown-menu";

import { useTableTab } from "../../hooks/useTableTab";
import { KeystoreRowDeleteAction } from "./KeystoreRowDeleteAction";

interface KeystoreRowActionsProps {
  rowId: string;
  name: string;
  accessLevel: ResourceAccessTypeEnum;
  isTenantWideAccess: boolean;
}

export const KeystoreRowActions = ({
  rowId,
  name,
  accessLevel,
  isTenantWideAccess,
}: KeystoreRowActionsProps) => {
  const actions = getResourceAccessActions(accessLevel);

  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  const { queryKey, isShared } = useTableTab();

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
          resourceType={ResourceTypeEnum.KeyStore}
          resourceName={name}
        />
      )}

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers Keystore delete alert dialog  */}
      {actions?.delete && <KeystoreRowDeleteAction rowId={rowId} />}

      {isShared && (
        <RemoveResourceRowAction queryKey={queryKey} rowId={rowId} />
      )}
    </DataTableRowActions>
  );
};
