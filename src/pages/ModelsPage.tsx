import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";
import { lazy, Suspense } from "react";

// Lazy load the ModelsTable component.
const ModelsTable = lazy(() =>
  import("@/features/models-table/components/ModelsTable").then((module) => ({
    default: module.ModelsTable,
  })),
);

/**
 * Renders the ModelsPage component.
 * @returns JSX element representing the ModelsPage component.
 */
export const ModelsPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <ModelsTable />
    </Suspense>
  );
};
