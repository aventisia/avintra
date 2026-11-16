import { TableCNSkeleton } from "@avplatform/ui/table-cn";
import { Suspense, lazy } from "react";

// Lazy load the QueueWorkItemDetail component.
const QueueWorkItemDetail = lazy(() =>
  import("@/features/02-configure/queues/work-items-table/components/QueueWorkItemDetail").then(
    (module) => ({
      default: module.QueueWorkItemDetail,
    }),
  ),
);

/**
 * Renders the work item detail page for a single queue work item.
 * @returns JSX element representing the QueueWorkItemDetailPage component.
 */
export const QueueWorkItemDetailPage = () => {
  return (
    <Suspense fallback={<TableCNSkeleton />}>
      <QueueWorkItemDetail />
    </Suspense>
  );
};
