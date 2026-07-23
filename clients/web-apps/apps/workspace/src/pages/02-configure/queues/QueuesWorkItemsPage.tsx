import { DataTableSkeleton } from "@avplatform/ui/data-table";
import { Suspense, lazy } from "react";

// Lazy load the WorkItemPayloadDataTable component.
const TriggersTable = lazy(() =>
  import("@/features/02-configure/queues/work-items-table/components/WorkItemsTable").then(
    (module) => ({
      default: module.WorkItemsTable,
    }),
  ),
);

/**
 * Renders the AgentsPage component.
 * @returns JSX element representing the AgentsPage component.
 */
export const QueuesWorkItemsPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <TriggersTable />
    </Suspense>
  );
};
