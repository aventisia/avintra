import { TableCNSkeleton } from "@avplatform/ui/table-cn";
import { Suspense, lazy } from "react";

// Lazy load the ConversationDetail component.
const ConversationDetail = lazy(() =>
  import("@/features/03-orchestrator/conversations-table/components/conversation-details/ConversationDetail").then(
    (module) => ({
      default: module.default,
    }),
  ),
);

/**
 * Renders the jobs execution logs component.
 * @returns JSX element representing the execution or jobs component.
 */
export const ConversationDetailsPage = () => {
  return (
    <Suspense fallback={<TableCNSkeleton />}>
      <ConversationDetail />
    </Suspense>
  );
};
