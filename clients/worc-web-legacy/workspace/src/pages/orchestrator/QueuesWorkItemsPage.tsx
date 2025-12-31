import { DataTableSkeleton } from "@aventisia/ui/data-table";
import { lazy, Suspense } from "react";

// Lazy load the WorkItemPayloadDataTable component.
const TriggersTable = lazy(() =>
  import(
    "@/features/orchestrator/work-items-table/components/WorkItemsTable"
  ).then((module) => ({
    default: module.WorkItemsTable,
  })),
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
