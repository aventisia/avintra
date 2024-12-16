import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";
import { lazy, Suspense } from "react";

// Lazy load the ProjectsTable component.
const FlowLogsTable = lazy(() =>
  import("@/features/flow-logs/components/FlowLogsTable").then((module) => ({
    default: module.FlowLogsTable,
  })),
);

/**
 * Renders the ProjectsPage component.
 * @returns JSX element representing the ProjectsPage component.
 */
export const LogsPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <FlowLogsTable />
    </Suspense>
  );
};
