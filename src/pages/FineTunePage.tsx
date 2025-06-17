import { DataTableSkeleton } from "@aventisia/ui/data-table";
import { Suspense, lazy } from "react";

// Lazy load the Fine Tune component.
const FineTuneContainer = lazy(() =>
  import("@/features/fine-tune/components/FineTune").then((module) => ({
    default: module.FineTune,
  })),
);

/**
 * Renders the Model library Page component.
 * @returns JSX element representing the Model library Page component.
 */
export const FineTunePage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <FineTuneContainer />
    </Suspense>
  );
};
