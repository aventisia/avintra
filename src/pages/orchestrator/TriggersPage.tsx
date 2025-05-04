import { DataTableSkeleton } from "@aventisia/ui/data-table";
import { lazy, Suspense } from "react";

// Lazy load the TriggersTable component.
const TriggersTable = lazy(() =>
  import(
    "@/features/orchestrator/triggers-table/components/TriggersTable"
  ).then((module) => ({
    default: module.TriggersTable,
  })),
);

/**
 * Renders the AgentsPage component.
 * @returns JSX element representing the AgentsPage component.
 */
export const TriggersPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <TriggersTable />
    </Suspense>
  );
};
