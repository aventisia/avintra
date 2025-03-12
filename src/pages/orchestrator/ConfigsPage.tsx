import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";
import { lazy, Suspense } from "react";

// Lazy load the ConfigsTable component.
const ConfigsTable = lazy(() =>
  import("@/features/orchestrator/configs-table/components/ConfigsTable").then(
    (module) => ({
      default: module.ConfigsTable,
    }),
  ),
);

/**
 * Renders the ConfigsPage component.
 * @returns JSX element representing the ConfigsTable component.
 */
export const ConfigsPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <ConfigsTable />
    </Suspense>
  );
};
