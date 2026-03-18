import { DataTableSkeleton } from "@aventisia/ui/data-table";
import { Suspense, lazy } from "react";

// Lazy load the TriggersTable component.
const TriggersTable = lazy(() =>
  import(
    "@/features/orchestrator/triggers/time-triggers-table/components/TriggersTable"
  ).then((module) => ({
    default: module.TriggersTable,
  })),
);

/**
 * Renders the EmailTriggerPage component.
 * @returns JSX element representing the EmailTriggerPage component.
 */
export const EmailTriggerPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <TriggersTable />
    </Suspense>
  );
};
