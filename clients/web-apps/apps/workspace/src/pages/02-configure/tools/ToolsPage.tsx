import { TableCNSkeleton } from "@avplatform/ui/table-cn";
import { Suspense, lazy } from "react";

const ToolsTable = lazy(() =>
  import("@/features/02-configure/tools/components/ToolsTable").then((module) => ({
    default: module.ToolsTable,
  })),
);

/**
 * Renders the ToolsPage component.
 */
export const ToolsPage = () => {
  return (
    <Suspense fallback={<TableCNSkeleton />}>
      <ToolsTable />
    </Suspense>
  );
};
