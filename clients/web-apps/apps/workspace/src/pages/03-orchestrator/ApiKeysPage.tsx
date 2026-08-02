import { DataTableSkeleton } from "@avplatform/ui/data-table";
import { Suspense, lazy } from "react";

// Lazy load the ApiKeysManagement component.
const ApiKeysTable = lazy(() =>
  import("@/features/03-orchestrator/api-keys/components/ApiKeysTable").then((module) => ({
    default: module.ApiKeysTable,
  })),
);

/**
 * Renders the ApiKeysPage component.
 * @returns JSX element representing the ApiKeysPage component.
 */
export const ApiKeysPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <ApiKeysTable />
    </Suspense>
  );
};
