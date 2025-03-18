import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";
import { lazy, Suspense } from "react";

// Lazy load the ConfigsTable component.
const ConfigsTable = lazy(() =>
  import("@/features/orchestrator/vault-table/components/VaultTable").then(
    (module) => ({
      default: module.VaultTable,
    }),
  ),
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
