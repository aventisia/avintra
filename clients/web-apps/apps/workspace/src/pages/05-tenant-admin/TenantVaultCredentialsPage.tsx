import { TableCNSkeleton } from "@avplatform/ui/table-cn";
import { Suspense, lazy } from "react";

import { VaultCredentialScopeProvider } from "@/features/02-configure/vault-credentials/contexts/vault-credential-scope.context";

const VaultCredentialTable = lazy(() =>
  import("@/features/02-configure/vault-credentials/components/VaultCredentialTable").then(
    (module) => ({ default: module.VaultCredentialTable }),
  ),
);

/**
 * Renders the tenant-level credentials page under Tenant Admin.
 */
export const TenantVaultCredentialsPage = () => (
  <VaultCredentialScopeProvider scope="tenant">
    <Suspense fallback={<TableCNSkeleton />}>
      <VaultCredentialTable />
    </Suspense>
  </VaultCredentialScopeProvider>
);
