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
 * Renders the WebhookTriggerPage component.
 * @returns JSX element representing the WebhookTriggerPage component.
 */
export const WebhookTriggerPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <TriggersTable />
    </Suspense>
  );
};
