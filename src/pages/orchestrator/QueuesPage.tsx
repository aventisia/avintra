import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";

import { Suspense, lazy } from "react";

// Lazy load the QueuesTable component.
const QueuesTable = lazy(() =>
  import("@/features/orchestrator/queues-table/components/QueuesTable").then(
    (module) => ({
      default: module.QueuesTable,
    }),
  ),
);

/**
 * Renders the AgentsPage component.
 * @returns JSX element representing the AgentsPage component.
 */
export const QueuesPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <QueuesTable />
    </Suspense>
  );
};
