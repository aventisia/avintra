import { DTRowAction, DataTableRowActions } from "@avplatform/ui/data-table";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";

import { useConfigureResourceAccessActions } from "@/features/02-configure/hooks/useConfigureResourceAccessActions.hook";
import { RemoveResourceRowAction } from "@/features/resource-share/components/common-row-actions/RemoveResourceRowAction";
import { ResourceShareRowAction } from "@/features/resource-share/components/common-row-actions/ResourceShareRowAction";
import { ResourceAccessTypeEnum } from "@/features/resource-share/enums/resource-access-type-enum";
import { ResourceTypeEnum } from "@/features/resource-share/enums/resource-type-enum";

import { useTableTab } from "../../hooks/useTableTab";
import { isCorsairCredentialType } from "../../vault-config/constants/corsair-integration-mapper";
import { isOAuthCredentialType } from "../../vault-config/constants/oauth-credential-types";
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
  const { queryKey } = useTableTab();

  const { actions, isProd, resourceActions } = useConfigureResourceAccessActions(accessLevel);

  return (
    <DataTableRowActions className="w-36 min-w-36">
      {actions?.read && <DTRowAction rowId={rowId} crudAction="read" entity="vault" />}
      {actions?.update && <DTRowAction rowId={rowId} crudAction="update" entity="vault" />}

      {resourceActions.share && (
        <ResourceShareRowAction
          rowId={rowId}
          isTenantWideAccess={isTenantWideAccess}
          resourceType={ResourceTypeEnum.VaultCredential}
          resourceName={name}
          disabled={isProd}
        />
      )}

      {actions?.update && isOAuthCredentialType(type) && <VaultRowReconnectAction rowId={rowId} />}
      {actions?.update && isCorsairCredentialType(type) && !isOAuthCredentialType(type) && (
        <VaultRowTestConnectionAction rowId={rowId} />
      )}

      <DropdownMenuSeparator />

      {resourceActions.delete && <VaultRowDeleteAction rowId={rowId} />}

      {accessLevel !== ResourceAccessTypeEnum.Owner && (
        <RemoveResourceRowAction queryKey={queryKey} rowId={rowId} disabled={isProd} />
      )}
    </DataTableRowActions>
  );
};
