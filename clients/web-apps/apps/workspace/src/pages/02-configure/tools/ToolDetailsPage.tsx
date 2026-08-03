import { DataTableSkeleton } from "@avplatform/ui/data-table";
import { Suspense, lazy } from "react";

const ToolDetails = lazy(() =>
  import("@/features/02-configure/tools/components/tool-details/ToolDetailsPage").then(
    (module) => ({
      default: module.ToolDetailsPage,
    }),
  ),
);

/**
 * Renders the ToolDetailsPage component.
 */
export const ToolDetailsPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <ToolDetails />
    </Suspense>
  );
};
