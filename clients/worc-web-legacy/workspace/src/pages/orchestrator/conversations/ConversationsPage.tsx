import { DataTableSkeleton } from "@aventisia/ui/data-table";
import { Suspense, lazy } from "react";

// Lazy load the ConversationsTable component.
const ConversationsTable = lazy(() =>
  import(
    "@/features/orchestrator/conversations-table/components/ConversationsTable"
  ).then((module) => ({
    default: module.ConversationsTable,
  })),
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
