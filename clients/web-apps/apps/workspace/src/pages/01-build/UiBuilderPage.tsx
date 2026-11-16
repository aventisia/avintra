import { TableCNSkeleton } from "@avplatform/ui/table-cn";
import { Suspense, lazy } from "react";

const UiBuilderTable = lazy(() =>
  import("@/features/01-build/ui-builder-table/components/UiBuilderTable").then((module) => ({
    default: module.UiBuilderTable,
  })),
);

/**
 * Renders the UiBuilderPage component.
 * @returns JSX element representing the UiBuilderPage component.
 */
export const UiBuilderPage = () => {
  return (
    <Suspense fallback={<TableCNSkeleton columnCount={7} />}>
      <UiBuilderTable />
    </Suspense>
  );
};
