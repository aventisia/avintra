import { type DialogCrudAction } from "@avplatform/ui/types";

import { VaultCredentialScopeProvider } from "../../contexts/vault-credential-scope.context";
import { VaultCredentialCrudDialogContent } from "./VaultCredentialCrudDialogContent";

interface TenantVaultCredentialCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const TenantVaultCredentialCrudDialogContent = (
  props: TenantVaultCredentialCrudDialogContentProps,
) => (
  <VaultCredentialScopeProvider scope="tenant">
    <VaultCredentialCrudDialogContent {...props} />
  </VaultCredentialScopeProvider>
);
