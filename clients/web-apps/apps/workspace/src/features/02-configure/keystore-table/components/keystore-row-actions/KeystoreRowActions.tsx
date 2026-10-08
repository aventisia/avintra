import { DTRowAction, DataTableRowActions } from "@avplatform/ui/data-table";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";

import { useConfigureResourceAccessActions } from "@/features/02-configure/hooks/useConfigureResourceAccessActions.hook";
import { RemoveResourceRowAction } from "@/features/resource-share/components/common-row-actions/RemoveResourceRowAction";
import { ResourceShareRowAction } from "@/features/resource-share/components/common-row-actions/ResourceShareRowAction";
import { ResourceAccessTypeEnum } from "@/features/resource-share/enums/resource-access-type-enum";
import { ResourceTypeEnum } from "@/features/resource-share/enums/resource-type-enum";

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
  const { actions, isProd, resourceActions } = useConfigureResourceAccessActions(accessLevel);

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
      {resourceActions.share && (
        <ResourceShareRowAction
          rowId={rowId}
          isTenantWideAccess={isTenantWideAccess}
          resourceType={ResourceTypeEnum.KeyStore}
          resourceName={name}
          disabled={isProd}
        />
      )}

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers Keystore delete alert dialog  */}
      {resourceActions.delete && <KeystoreRowDeleteAction rowId={rowId} />}

      {/* Remove the resource from the user's shared list (shown for rows not owned by the user) */}
      {accessLevel !== ResourceAccessTypeEnum.Owner && (
        <RemoveResourceRowAction queryKey={queryKey} rowId={rowId} disabled={isProd} />
      )}
    </DataTableRowActions>
  );
};
