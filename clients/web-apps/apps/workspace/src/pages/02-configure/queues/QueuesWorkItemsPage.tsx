import { DataTableSkeleton } from "@avplatform/ui/data-table";
import { Suspense, lazy } from "react";
import { useParams } from "react-router-dom";

// Lazy load the WorkItemPayloadDataTable component.
const TriggersTable = lazy(() =>
  import("@/features/02-configure/queues/work-items-table/components/WorkItemsTable").then(
    (module) => ({
      default: module.WorkItemsTable,
    }),
  ),
);

/**
 * Renders the work-items page for a queue.
 * @returns JSX element representing the QueuesWorkItemsPage component.
 */
export const QueuesWorkItemsPage = () => {
  const { qid } = useParams();

  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <TriggersTable key={qid} />
    </Suspense>
  );
};
