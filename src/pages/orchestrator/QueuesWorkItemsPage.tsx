import { DataTableSkeleton } from "@aventisia/ui/data-table";
import { lazy, Suspense } from "react";

// Lazy load the QueuesWorkItemsTable component.
const QueuesWorkItemsTable = lazy(() =>
  import(
    "@/features/orchestrator/work-items-table/components/QueuesWorkItemsTable"
  ).then((module) => ({
    default: module.QueuesWorkItemsTable,
  })),
);

/**
 * Renders the AgentsPage component.
 * @returns JSX element representing the AgentsPage component.
 */
export const QueuesWorkItemsPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <QueuesWorkItemsTable />
    </Suspense>
  );
};
