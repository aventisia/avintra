import { DataTableSkeleton } from "@aventisia/ui/data-table";
import { lazy, Suspense } from "react";

// Lazy load the FlowsTable component.
const ArchivesTable = lazy(() =>
  import("@/features/archives-table/components/FlowsTable").then((module) => ({
    default: module.ArchivesTable,
  })),
);

/**
 * Renders the AchievesPage component.
 * @returns JSX element representing the AchievesPage component.
 */
export const AchievesPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <ArchivesTable />
    </Suspense>
  );
};
