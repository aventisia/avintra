import { DTRowAction, DataTableRowActions } from "@avplatform/ui/data-table";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";

import { useConfigureResourceAccessActions } from "@/features/02-configure/hooks/useConfigureResourceAccessActions.hook";
import { ResourceFlowAccessRowAction } from "@/features/resource-flow-access/components/common-row-actions/ResourceFlowAccessRowAction";
import { RemoveResourceRowAction } from "@/features/resource-user-access/components/common-row-actions/RemoveResourceRowAction";
import { ResourceUserAccessRowAction } from "@/features/resource-user-access/components/common-row-actions/ResourceUserAccessRowAction";
import { ResourceAccessTypeEnum } from "@/features/resource-user-access/enums/resource-access-type-enum";
import { ResourceTypeEnum } from "@/features/resource-user-access/enums/resource-type-enum";

import { useTableTab } from "../../hooks/useTableTab";
import { isCorsairCredentialType } from "../../vault-credential-config/constants/corsair-integration-mapper";
import { isOAuthCredentialType } from "../../vault-credential-config/constants/vault-credential-oauth-types.constant";
import { VaultCredentialRowDeleteAction } from "./VaultCredentialRowDeleteAction";
import { VaultCredentialRowReconnectAction } from "./VaultCredentialRowReconnectAction";
import { VaultCredentialRowTestConnectionAction } from "./VaultCredentialRowTestConnectionAction";

interface VaultCredentialRowActionsProps {
  rowId: string;
  name: string;
  type?: string;
  accessLevel?: ResourceAccessTypeEnum;
  isTenantWideAccess: boolean;
  isResourceAccessRestricted: boolean;
}

export const VaultCredentialRowActions = ({
  rowId,
  name,
  type,
  accessLevel = ResourceAccessTypeEnum.View,
  isTenantWideAccess,
  isResourceAccessRestricted,
}: VaultCredentialRowActionsProps) => {
  const { queryKey } = useTableTab();

  const { actions, isProd, resourceActions } = useConfigureResourceAccessActions(accessLevel);

  return (
    <DataTableRowActions className="w-36 min-w-36">
      {actions?.read && <DTRowAction rowId={rowId} crudAction="read" entity="vault" />}
      {actions?.update && <DTRowAction rowId={rowId} crudAction="update" entity="vault" />}

      {actions?.update && (
        <ResourceFlowAccessRowAction
          rowId={rowId}
          resourceName={name}
          resourceType={ResourceTypeEnum.VaultCredential}
          isRestricted={isResourceAccessRestricted}
          disabled={isProd}
        />
      )}

      {resourceActions.share && (
        <ResourceUserAccessRowAction
          rowId={rowId}
          isTenantWideAccess={isTenantWideAccess}
          resourceType={ResourceTypeEnum.VaultCredential}
          resourceName={name}
        />
      )}

      {actions?.update && isOAuthCredentialType(type) && (
        <VaultCredentialRowReconnectAction rowId={rowId} />
      )}
      {actions?.update && isCorsairCredentialType(type) && !isOAuthCredentialType(type) && (
        <VaultCredentialRowTestConnectionAction rowId={rowId} />
      )}

      <DropdownMenuSeparator />

      {resourceActions.delete && <VaultCredentialRowDeleteAction rowId={rowId} />}

      {accessLevel !== ResourceAccessTypeEnum.Owner && (
        <RemoveResourceRowAction queryKey={queryKey} rowId={rowId} />
      )}
    </DataTableRowActions>
  );
};
