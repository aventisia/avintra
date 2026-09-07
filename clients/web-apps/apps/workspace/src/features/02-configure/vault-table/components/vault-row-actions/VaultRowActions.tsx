import { DTRowAction, DataTableRowActions } from "@avplatform/ui/data-table";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";

import { RemoveResourceRowAction } from "@/features/resource-share/components/common-row-actions/RemoveResourceRowAction";
import { ResourceShareRowAction } from "@/features/resource-share/components/common-row-actions/ResourceShareRowAction";
import { ResourceAccessTypeEnum } from "@/features/resource-share/enums/resource-access-type-enum";
import { ResourceTypeEnum } from "@/features/resource-share/enums/resource-type-enum";
import { getResourceAccessActions } from "@/features/resource-share/utils/resource-access-actions";

import { isOAuthCredentialType } from "../../vault-config/constants/oauth-credential-types";
import { isCorsairCredentialType } from "../../vault-config/constants/corsair-integration-mapper";
import { useTableTab } from "../../hooks/useTableTab";
import { VaultRowDeleteAction } from "./VaultRowDeleteAction";
import { VaultRowReconnectAction } from "./VaultRowReconnectAction";
import { VaultRowTestConnectionAction } from "./VaultRowTestConnectionAction";

interface VaultRowActionsProps {
  rowId: string;
  name: string;
  type?: string;
  accessLevel?: ResourceAccessTypeEnum;
  isTenantWideAccess: boolean;
}

export const VaultRowActions = ({
  rowId,
  name,
  type,
  accessLevel = ResourceAccessTypeEnum.View,
  isTenantWideAccess,
}: VaultRowActionsProps) => {
  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  const { isShared, queryKey } = useTableTab();

  const actions = getResourceAccessActions(accessLevel);

  return (
    // Dropdown menu for config table row action */}
    <DataTableRowActions className="w-36 min-w-36">
      {actions?.read && <DTRowAction rowId={rowId} crudAction="read" entity="vault" />}
      {actions?.update && <DTRowAction rowId={rowId} crudAction="update" entity="vault" />}

      {/* Share Access */}
      {actions?.share && (
        <ResourceShareRowAction
          rowId={rowId}
          isTenantWideAccess={isTenantWideAccess}
          resourceType={ResourceTypeEnum.AppSecret}
          resourceName={name}
        />
      )}

      {/* Reconnect OAuth for OAuth-capable credentials */}
      {actions?.update && isOAuthCredentialType(type) && <VaultRowReconnectAction rowId={rowId} />}
      {actions?.update && isCorsairCredentialType(type) && !isOAuthCredentialType(type) && (
        <VaultRowTestConnectionAction rowId={rowId} />
      )}

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers Config delete alert dialog  */}
      {actions?.delete && <VaultRowDeleteAction rowId={rowId} />}

      {isShared && <RemoveResourceRowAction queryKey={queryKey} rowId={rowId} />}
    </DataTableRowActions>
  );
};
