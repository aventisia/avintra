import { TableCNSkeleton } from "@avplatform/ui/table-cn";
import { Suspense, lazy } from "react";

// Lazy load the MessageTriggersTable component.
const MessageTriggersTable = lazy(() =>
  import("@/features/02-configure/triggers/message-triggers-table/components/MessageTriggersTable").then(
    (module) => ({
      default: module.MessageTriggersTable,
    }),
  ),
);

/**
 * Renders the MessageTriggerPage component.
 * @returns JSX element representing the MessageTriggerPage component.
 */
export const MessageTriggerPage = () => {
  return (
    <Suspense fallback={<TableCNSkeleton />}>
      <MessageTriggersTable />
    </Suspense>
  );
};
