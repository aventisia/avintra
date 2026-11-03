import { TableCNSkeleton } from "@avplatform/ui/table-cn";
import { Suspense, lazy } from "react";

// Lazy load the ArchivedFlowsTable component.
const ArchivedFlowsTable = lazy(() =>
  import("@/features/05-tenant-admin/archives-table/components/ArchivedFlowsTable").then(
    (module) => ({
      default: module.ArchivedFlowsTable,
    }),
  ),
);

/**
 * Renders the AchievesPage component.
 * @returns JSX element representing the AchievesPage component.
 */
export const AchievesPage = () => {
  return (
    <Suspense fallback={<TableCNSkeleton />}>
      <ArchivedFlowsTable />
    </Suspense>
  );
};
