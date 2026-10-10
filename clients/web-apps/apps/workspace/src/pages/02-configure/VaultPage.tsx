import { DataTableSkeleton } from "@avplatform/ui/data-table";
import { Suspense, lazy } from "react";

// Lazy load the ConfigsTable component.
const ConfigsTable = lazy(() =>
  import("@/features/02-configure/vault-credentials/components/VaultTable").then((module) => ({
    default: module.VaultTable,
  })),
);

/**
 * Renders the ConfigsPage component.
 * @returns JSX element representing the ConfigsTable component.
 */
export const VaultPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <ConfigsTable />
    </Suspense>
  );
};
