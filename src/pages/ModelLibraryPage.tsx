import { DataTableSkeleton } from "@aventisia/ui/data-table";
import { lazy, Suspense } from "react";

// Lazy load the ModelLibraryTable component.
const ModelLibraryTable = lazy(() =>
  import("@/features/model-library-table/components/ModelLibraryTable").then(
    (module) => ({
      default: module.ModelLibraryTable,
    }),
  ),
);

/**
 * Renders the Model library Page component.
 * @returns JSX element representing the Model library Page component.
 */
export const ModelLibraryPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <ModelLibraryTable />
    </Suspense>
  );
};
