import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";
import { lazy, Suspense } from "react";

// Lazy load the AgentsTable component.
const AgentsTable = lazy(() =>
  import("@/features/orchestrator/agents-table/components/AgentsTable").then(
    (module) => ({
      default: module.AgentsTable,
    }),
  ),
);

/**
 * Renders the AgentsPage component.
 * @returns JSX element representing the AgentsPage component.
 */
export const AgentsPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <AgentsTable />
    </Suspense>
  );
};
