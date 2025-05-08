import { DataTableSkeleton } from "@aventisia/ui/data-table";
import { lazy, Suspense } from "react";

// Lazy load the WorkItemPayloadDataTable component.
const WorkItemPayloadDataTable = lazy(() =>
  import(
    "@/features/orchestrator/work-items-table/components/WorkItemPayloadDataTable"
  ).then((module) => ({
    default: module.WorkItemPayloadDataTable,
  })),
);

/**
 * Renders the AgentsPage component.
 * @returns JSX element representing the AgentsPage component.
 */
export const QueuesWorkItemsPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <WorkItemPayloadDataTable />
    </Suspense>
  );
};
