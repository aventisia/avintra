import { TableCNSkeleton } from "@avplatform/ui/table-cn";
import { Suspense, lazy } from "react";

// Lazy load the FlowsTable component.
const FlowsTable = lazy(() =>
  import("@/features/01-build/flows-table/components/FlowsTable").then((module) => ({
    default: module.FlowsTable,
  })),
);

/**
 * Renders the FlowsPage component.
 * @returns JSX element representing the FlowsPage component.
 */
export const FlowsPage = () => {
  return (
    <Suspense fallback={<TableCNSkeleton />}>
      <FlowsTable />
    </Suspense>
  );
};
