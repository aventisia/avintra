import { DataTableSkeleton } from "@aventisia/ui/data-table";
import { lazy, Suspense } from "react";

// Lazy load the ArchivedFlowsTable component.
const ArchivedFlowsTable = lazy(() =>
  import("@/features/archives-table/components/ArchivedFlowsTable").then((module) => ({
    default: module.ArchivedFlowsTable,
  })),
);

/**
 * Renders the AchievesPage component.
 * @returns JSX element representing the AchievesPage component.
 */
export const AchievesPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <ArchivedFlowsTable />
    </Suspense>
  );
};
