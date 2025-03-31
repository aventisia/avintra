import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";
import { lazy, Suspense } from "react";

// Lazy load the Flow logs component.
const FlowLogsTable = lazy(() =>
  import("@/features/flow-logs/components/FlowLogsTable").then((module) => ({
    default: module.FlowLogsTable,
  })),
);

/**
 * Renders the Flow logs component.
 * @returns JSX element representing the Flow logs component.
 */
export const LogsPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <FlowLogsTable />
    </Suspense>
  );
};
