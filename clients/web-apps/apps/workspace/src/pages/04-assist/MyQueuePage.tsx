import { TableCNSkeleton } from "@avplatform/ui/table-cn";
import { Suspense, lazy } from "react";

// Lazy load the MyQueue component.
const MyQueue = lazy(() =>
  import("@/features/04-assist/my-queues/components/MyQueue").then((module) => ({
    default: module.MyQueue,
  })),
);

/**
 * Renders the MyQueue table component.
 * @returns JSX element representing the execution or my-queue component.
 */
export const MyQueuePage = () => {
  return (
    <Suspense fallback={<TableCNSkeleton />}>
      <MyQueue />
    </Suspense>
  );
};
