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
 * Renders the MessageTriggerPage component.
 * @returns JSX element representing the MessageTriggerPage component.
 */
export const MessageTriggerPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <TriggersTable />
    </Suspense>
  );
};
