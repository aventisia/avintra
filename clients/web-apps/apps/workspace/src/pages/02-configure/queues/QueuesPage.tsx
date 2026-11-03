import { TableCNSkeleton } from "@avplatform/ui/table-cn";
import { Suspense, lazy } from "react";

// Lazy load the QueuesTable component.
const QueuesTable = lazy(() =>
  import("@/features/02-configure/queues/queues-table/components/QueuesTable").then((module) => ({
    default: module.QueuesTable,
  })),
);

/**
 * Renders the AgentsPage component.
 * @returns JSX element representing the AgentsPage component.
 */
export const QueuesPage = () => {
  return (
    <Suspense fallback={<TableCNSkeleton />}>
      <QueuesTable />
    </Suspense>
  );
};
