import { TableCNSkeleton } from "@avplatform/ui/table-cn";
import { Suspense, lazy } from "react";

// Lazy load the ConfigsTable component.
const ConfigsTable = lazy(() =>
  import("@/features/02-configure/vault-credentials/components/VaultCredentialTable").then(
    (module) => ({
      default: module.VaultCredentialTable,
    }),
  ),
);

/**
 * Renders the ConfigsPage component.
 * @returns JSX element representing the ConfigsTable component.
 */
export const VaultCredentialPage = () => {
  return (
    <Suspense fallback={<TableCNSkeleton />}>
      <ConfigsTable />
    </Suspense>
  );
};
