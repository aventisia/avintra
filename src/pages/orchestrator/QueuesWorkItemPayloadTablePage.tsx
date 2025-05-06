import { lazy, Suspense } from "react";

import { DataTableSkeleton } from "@aventisia/ui/data-table";

// Lazy load the WorkItemPayloadDataTable component.
const WorkItemPayloadDataTable = lazy(() =>
  import(
    "@/features/orchestrator/queues-table/work-items-table/components/payload-table/WorkItemPayloadDataTable"
  ).then((module) => ({
    default: module.WorkItemPayloadDataTable,
  })),
);

/**
 * Renders the AgentsPage component.
 * @returns JSX element representing the AgentsPage component.
 */
export const QueuesWorkItemPayloadTablePages = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <WorkItemPayloadDataTable />
    </Suspense>
  );
};
