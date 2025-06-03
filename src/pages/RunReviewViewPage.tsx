import { Suspense, lazy } from "react";

// Lazy load the Run Review component.
const RunReviewViewContainer = lazy(() =>
  import("@/features/run-review-view/components").then((module) => ({
    default: module.RunReviewView,
  })),
);

/**
 * Renders the Model library Page component.
 * @returns JSX element representing the Model library Page component.
 */
export const RunReivewViewPage = () => {
  return (
    <Suspense>
      <RunReviewViewContainer />
    </Suspense>
  );
};
