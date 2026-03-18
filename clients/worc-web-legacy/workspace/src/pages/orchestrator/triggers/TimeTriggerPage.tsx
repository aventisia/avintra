import { DataTableSkeleton } from "@aventisia/ui/data-table";
import { Suspense, lazy } from "react";

// Lazy load the TriggersTable component.
const TriggersTable = lazy(() =>
  import(
    "@/features/orchestrator/triggers-table/components/TriggersTable"
  ).then((module) => ({
    default: module.TriggersTable,
  })),
);

/**
 * Renders the TimeTriggerPage component.
 * @returns JSX element representing the TimeTriggerPage component.
 */
export const TimeTriggerPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <TriggersTable />
    </Suspense>
  );
};
