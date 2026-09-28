import { DTRowAction, DataTableRowActions } from "@avplatform/ui/data-table";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";

import { RemoveResourceRowAction } from "@/features/resource-share/components/common-row-actions/RemoveResourceRowAction";
import { ResourceShareRowAction } from "@/features/resource-share/components/common-row-actions/ResourceShareRowAction";
import { ResourceAccessTypeEnum } from "@/features/resource-share/enums/resource-access-type-enum";
import { ResourceTypeEnum } from "@/features/resource-share/enums/resource-type-enum";
import { getResourceAccessActions } from "@/features/resource-share/utils/resource-access-actions";

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

  // Get the query key used to invalidate both merged lists after a mutation
  const { queryKey } = useTableTab();

  return (
    // Dropdown menu for keystore table row action */}
    <DataTableRowActions className="w-36 min-w-36">
      {/* View the keystore details */}
      {actions?.read && <DTRowAction rowId={rowId} crudAction="read" entity="keystore" />}

      {/* Edit keystore details */}
      {actions?.update && <DTRowAction rowId={rowId} crudAction="update" entity="keystore" />}

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

      {/* Remove the resource from the user's shared list (shown for rows not owned by the user) */}
      {accessLevel !== ResourceAccessTypeEnum.Owner && (
        <RemoveResourceRowAction queryKey={queryKey} rowId={rowId} />
      )}
    </DataTableRowActions>
  );
};
