import { DataTableSkeleton } from "@aventisia/ui/data-table";
import { Suspense, lazy } from "react";

// Lazy load the Run Review component.
const RunReviewContainer = lazy(() =>
  import("@/features/run-review/components/RunReview").then((module) => ({
    default: module.RunReview,
  })),
);

/**
 * Renders the Model library Page component.
 * @returns JSX element representing the Model library Page component.
 */
export const RunReivewPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <RunReviewContainer />
    </Suspense>
  );
};
