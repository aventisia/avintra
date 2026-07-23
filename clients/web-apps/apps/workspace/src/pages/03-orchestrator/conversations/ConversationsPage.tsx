import { DataTableSkeleton } from "@avplatform/ui/data-table";
import { Suspense, lazy } from "react";

// Lazy load the ConversationsTable component.
const ConversationsTable = lazy(() =>
  import("@/features/03-orchestrator/conversations-table/components/ConversationsTable").then(
    (module) => ({
      default: module.ConversationsTable,
    }),
  ),
);

/**
 * Renders the conversations table component.
 * @returns JSX element representing the execution or conversations component.
 */
export const ConversationsPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <ConversationsTable />
    </Suspense>
  );
};
