import { TableCNSkeleton } from "@avplatform/ui/table-cn";
import { Suspense, lazy } from "react";

// Lazy load the WebhookTriggersTable component.
const WebhookTriggersTable = lazy(() =>
  import("@/features/02-configure/triggers/webhook-triggers-table/components/WebhookTriggersTable").then(
    (module) => ({
      default: module.WebhookTriggersTable,
    }),
  ),
);

/**
 * Renders the WebhookTriggerPage component.
 * @returns JSX element representing the WebhookTriggerPage component.
 */
export const WebhookTriggerPage = () => {
  return (
    <Suspense fallback={<TableCNSkeleton />}>
      <WebhookTriggersTable />
    </Suspense>
  );
};
